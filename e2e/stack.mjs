// A local Supabase for tests, without Docker: Postgres + Supabase Auth + PostgREST
// behind one port, and a small stand-in for file storage.
import { spawn, execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const here = dirname(fileURLToPath(import.meta.url));
const bin = join(here, ".bin");
const API = 54421, AUTH = 54422, REST = 54423, PG = 54424;
const SECRET = "local-test-secret-local-test-secret-123";

function fetchTool(name, url, flag) {
  const dir = join(bin, name);
  if (existsSync(dir) && readdirSync(dir).length) return dir;
  mkdirSync(dir, { recursive: true });
  execFileSync("bash", ["-c", `curl -fsSL "$0" | tar x${flag} -C "$1"`, url, dir]);
  return dir;
}
const rest = fetchTool("postgrest", "https://github.com/PostgREST/postgrest/releases/download/v16.6/postgrest-v16.6-linux-static-x86-64.tar.xz", "J");
const auth = fetchTool("auth", "https://github.com/supabase/auth/releases/download/v2.198.0/auth-v2.198.0-x86.tar.gz", "z");

const pg = new EmbeddedPostgres({
  databaseDir: mkdtempSync(join(tmpdir(), "elcentro-pg-")), user: "postgres", password: "postgres", port: PG, persistent: false, onLog: () => {},
});
await pg.initialise();
await pg.start();
const sql = pg.getPgClient("postgres");
sql.on("error", () => {}); // Postgres going away at shutdown
await sql.connect();
await sql.query(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create role authenticator noinherit login password 'postgres'; grant anon, authenticated, service_role to authenticator;
  create schema auth; alter database postgres set search_path to public;
  create schema storage; create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, storage to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`);

const jwt = (role) => {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const body = `${b({ alg: "HS256", typ: "JWT" })}.${b({ role, iss: "supabase", iat: 1700000000, exp: 4000000000 })}`;
  return `${body}.${createHmac("sha256", SECRET).update(body).digest("base64url")}`;
};
const dbUrl = `postgres://postgres:postgres@127.0.0.1:${PG}/postgres?sslmode=disable`;
const kids = [];
const run = (cmd, args, env, cwd) => {
  const c = spawn(cmd, args, { env: { PATH: process.env.PATH, ...env }, cwd, stdio: ["ignore", "pipe", "pipe"] });
  for (const s of [c.stdout, c.stderr]) s.on("data", (d) => process.env.STACK_LOG && process.stderr.write(d));
  kids.push(c);
};
const stop = async () => {
  kids.forEach((k) => k.kill());
  await sql.end().catch(() => {});
  await pg.stop().catch(() => {});
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

run(join(auth, "auth"), [], {
  GOTRUE_DB_DRIVER: "postgres", DATABASE_URL: dbUrl + "&search_path=auth", DB_NAMESPACE: "auth",
  GOTRUE_DB_MIGRATIONS_PATH: join(auth, "migrations"), GOTRUE_API_HOST: "127.0.0.1", PORT: String(AUTH), GOTRUE_API_PORT: String(AUTH),
  API_EXTERNAL_URL: `http://127.0.0.1:${API}/auth/v1`, GOTRUE_SITE_URL: "http://127.0.0.1:4499", GOTRUE_URI_ALLOW_LIST: "http://127.0.0.1:4499/**",
  GOTRUE_JWT_SECRET: SECRET, GOTRUE_JWT_AUD: "authenticated", GOTRUE_JWT_DEFAULT_GROUP_NAME: "authenticated", GOTRUE_JWT_ADMIN_ROLES: "service_role",
  GOTRUE_MAILER_AUTOCONFIRM: "true", GOTRUE_EXTERNAL_EMAIL_ENABLED: "true", GOTRUE_DISABLE_SIGNUP: "false", GOTRUE_RATE_LIMIT_EMAIL_SENT: "1000",
}, auth);
const up = async (url) => {
  for (let i = 0; i < 150; i++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("did not start: " + url);
};
await up(`http://127.0.0.1:${AUTH}/health`);
// auth.uid() as on hosted Supabase, then the real migration.
await sql.query(`create or replace function auth.uid() returns uuid language sql stable as
  $$ select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role; set search_path = public;`);
for (const f of readdirSync(join(here, "../supabase/migrations")).sort())
  await sql.query(readFileSync(join(here, "../supabase/migrations", f), "utf8"));
run(join(rest, "postgrest"), [], {
  PGRST_DB_URI: `postgres://authenticator:postgres@127.0.0.1:${PG}/postgres`, PGRST_DB_SCHEMAS: "public", PGRST_DB_ANON_ROLE: "anon",
  PGRST_JWT_SECRET: SECRET, PGRST_SERVER_PORT: String(REST), PGRST_SERVER_HOST: "127.0.0.1",
});
await up(`http://127.0.0.1:${REST}/`);

const anon = jwt("anon");
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", "access-control-expose-headers": "*" };
const files = new Map();
http.createServer((req, res) => {
  if (req.method === "OPTIONS") return res.writeHead(204, { ...cors, "access-control-allow-headers": req.headers["access-control-request-headers"] ?? "*" }).end();
  const chunks = [];
  req.on("data", (c) => chunks.push(c)).on("end", async () => {
    const json = (o, s = 200) => res.writeHead(s, { ...cors, "content-type": "application/json" }).end(JSON.stringify(o));
    try {
      if (req.url === "/health") return json({ ok: true });
      if (req.url.startsWith("/test/pastor")) {
        await sql.query("select private.make_pastor($1, $2)", [new URL(req.url, "http://x").searchParams.get("email"), "김요셉"]);
        return json({});
      }
      if (req.url.startsWith("/test/link")) {
        // The link Supabase would put in a sign-in or password-reset email.
        const q = new URL(req.url, "http://x").searchParams;
        const r = await fetch(`http://127.0.0.1:${AUTH}/admin/generate_link`, {
          method: "POST",
          headers: { authorization: `Bearer ${jwt("service_role")}`, "content-type": "application/json" },
          body: JSON.stringify({ type: q.get("type"), email: q.get("email"), redirect_to: `http://127.0.0.1:4499${q.get("to")}` }),
        });
        return json(await r.json());
      }
      if (req.url.startsWith("/storage/v1/object/sign/")) {
        return json({ signedURL: req.url.replace("/storage/v1", "").replace("/sign/", "/raw/") });
      }
      if (req.url.startsWith("/storage/v1/object/raw/")) {
        const b = files.get(req.url.split("/raw/")[1]);
        return b ? res.writeHead(200, { ...cors, "content-type": "text/plain" }).end("file") : json({}, 404);
      }
      if (req.url.startsWith("/storage/v1/object/")) {
        files.set(req.url.split("/object/")[1], Buffer.concat(chunks));
        return json({ Key: "ok", Id: "1" });
      }
      const [prefix, port] = req.url.startsWith("/verify") ? ["", AUTH] : req.url.startsWith("/auth/v1") ? ["/auth/v1", AUTH] : ["/rest/v1", REST];
      const headers = { ...req.headers };
      for (const h of ["host", "connection", "content-length", "transfer-encoding", "accept-encoding"]) delete headers[h];
      // As the hosted gateway does, turn the publishable key into the anon role.
      if (!headers.authorization || headers.authorization === "Bearer test") headers.authorization = `Bearer ${anon}`;
      const r = await fetch(`http://127.0.0.1:${port}${req.url.slice(prefix.length)}`, {
        method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined, redirect: "manual",
      });
      const h = { ...Object.fromEntries(r.headers), ...cors };
      delete h["content-encoding"]; delete h["transfer-encoding"]; delete h["content-length"];
      res.writeHead(r.status, h).end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { json({ message: String(e) }, 500); }
  });
}).listen(API, "127.0.0.1");

// Serve the static export the way GitHub Pages does.
const types = { html: "text/html", js: "text/javascript", css: "text/css", jpg: "image/jpeg", woff2: "font/woff2", txt: "text/plain", ico: "image/x-icon" };
http.createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const root = join(here, "../out");
  const file = [path, path + ".html", join(path, "index.html")].map((p) => join(root, p)).find((p) => p.startsWith(root) && existsSync(p) && /\.\w+$/.test(p));
  if (!file) return res.writeHead(404, { "content-type": "text/html" }).end(readFileSync(join(root, "404.html")));
  res.writeHead(200, { "content-type": types[file.split(".").pop()] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(4499, "127.0.0.1");
console.log("stack ready");
