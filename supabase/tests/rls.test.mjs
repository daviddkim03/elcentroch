// Security rules, exercised as each kind of user on an in-process Postgres.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const uid = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const U = { pastor: uid(1), admin: uid(2), ann: uid(3), ben: uid(4), pending: uid(5), stranger: uid(6) };
const id = {};

// Run SQL the way an API request does: as the role, with the user's id, and
// with session_user = authenticator.
async function as(who, sql, params = []) {
  await db.exec(`reset role; set session authorization postgres; set session authorization authenticator;
    set role ${who === "anon" ? "anon" : "authenticated"};
    select set_config('test.uid', '${U[who] ?? ""}', false)`);
  try {
    return (await db.query(sql, params)).rows;
  } finally {
    await db.exec("reset role; set session authorization postgres; select set_config('test.uid', '', false)");
  }
}
const root = async (sql, params) => (await db.query(sql, params)).rows;
const denied = (p) => assert.rejects(p, (e) => ["42501", "23514", "P0002"].includes(e.code) || assert.fail(e.message));

before(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create role authenticator noinherit login; grant anon, authenticated to authenticator;
    create schema auth; grant usage on schema auth to anon, authenticated;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    -- Supabase's defaults, which the migration has to undo.
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on functions to anon, authenticated;
    create schema storage; create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon, authenticated;
    grant all on storage.objects to anon, authenticated;
  `);
  const dir = new URL("../migrations/", import.meta.url);
  for (const f of readdirSync(dir).sort()) await db.exec(readFileSync(new URL(f, dir), "utf8"));
  for (const [n, u] of Object.entries(U))
    await root("insert into auth.users values ($1, $2, now())", [u, `${n}@x.test`]);
  await root("select private.make_pastor('pastor@x.test', '목사')");
  for (const n of ["admin", "ann", "ben", "pending"])
    await as(n, "select apply_for_membership($1, '', '', '')", [n]);
  for (const m of await root("select id, name_ko from members")) id[m.name_ko === "목사" ? "pastor" : m.name_ko] = m.id;
  for (const n of ["admin", "ann", "ben"]) await as("pastor", "select approve_member($1)", [id[n]]);
  await as("pastor", "update members set role='admin' where id=$1", [id.admin]);
  id.g = (await as("pastor", "insert into groups(name_ko, leader_id) values ('1구역', $1) returning id", [id.ann]))[0].id;
  await as("pastor", "update members set group_id=$1 where id=$2", [id.g, id.ann]);
});
after(() => db.close());

test("anonymous visitors reach public content only", async () => {
  await as("pastor", "insert into announcements(title_ko, is_public) values ('공개', true), ('비공개', false)");
  assert.equal((await as("anon", "select * from announcements")).length, 1);
  for (const t of ["members", "households", "groups", "prayers", "children", "giving", "care_notes", "visits", "access_log", "attendance", "serving_slots", "event_rsvps", "child_checkins", "group_posts", "prayer_supports"])
    await denied(as("anon", `select * from ${t}`));
  await denied(as("anon", "select * from directory()"));
  await denied(as("anon", "insert into announcements(title_ko) values ('x')"));
});

test("pending and unregistered accounts see nothing but themselves", async () => {
  assert.equal((await as("pending", "select * from members")).length, 1);
  assert.equal((await as("stranger", "select * from members")).length, 0);
  for (const n of ["pending", "stranger"]) {
    assert.equal((await as(n, "select * from announcements")).length, 1);
    for (const t of ["prayers", "groups", "serving_slots", "giving", "children", "access_log", "storage.objects"])
      assert.equal((await as(n, `select * from ${t}`)).length, 0, t);
    assert.equal((await as(n, "select * from directory()")).length, 0);
    await denied(as(n, "insert into prayers(body) values ('x')"));
  }
  await as("pending", "update members set status='active', role='pastor'");
  assert.deepEqual(await root("select status, role from members where name_ko='pending'"), [{ status: "pending", role: "member" }]);
  await denied(as("stranger", `insert into members(user_id, name_ko, status, role) values ('${U.stranger}', 'x', 'active', 'pastor')`));
});

test("only the pastor approves or assigns roles", async () => {
  for (const n of ["admin", "ann", "pending"]) await denied(as(n, "select approve_member($1)", [id.pending]));
  await denied(as("admin", "update members set status='active' where id=$1", [id.pending]));
  await denied(as("admin", "update members set role='pastor' where id=$1", [id.admin]));
  await denied(as("admin", "update members set phone='1' where id=$1", [id.pastor]));
  await denied(as("admin", "insert into members(name_ko, role, status) values ('x', 'pastor', 'active')"));
  await denied(as("pastor", "update members set user_id=$1 where id=$2", [U.stranger, id.admin]));
});

test("the last pastor can't be demoted or deleted", async () => {
  await denied(as("pastor", "update members set role='member' where id=$1", [id.pastor]));
  await as("pastor", "delete from members where id=$1", [id.pastor]);
  assert.equal((await root("select * from members where role='pastor'")).length, 1);
});

test("members edit their contact details but not church fields or others", async () => {
  await as("ann", "update members set phone='555', directory_listed=true where id=$1", [id.ann]);
  for (const set of ["role='admin'", "status='inactive'", "church_title='장로'", "group_id=null", "household_id=gen_random_uuid()"])
    await denied(as("ann", `update members set ${set} where user_id='${U.ann}'`));
  await as("ann", "update members set phone='666' where id=$1", [id.ben]);
  assert.equal((await root("select phone from members where id=$1", [id.ben]))[0].phone, null);
  assert.equal((await as("ann", "select * from members")).length, 1);
});

test("directory shows only what each member turned on", async () => {
  const d = await as("ben", "select * from directory()");
  assert.deepEqual(d.map((r) => [r.name_ko, r.phone]), [["ann", null]]);
  await as("ann", "update members set directory_phone=true where id=$1", [id.ann]);
  assert.equal((await as("ben", "select * from directory()"))[0].phone, "555");
});

test("an approved request can be linked to an existing record, once", async () => {
  await as("stranger", "select apply_for_membership('새이름','','777','')");
  const r = (await root("select id from members where user_id=$1", [U.stranger]))[0].id;
  const rec = (await as("admin", "insert into members(name_ko, status) values ('기존', 'active') returning id"))[0].id;
  await assert.rejects(as("pastor", "select approve_member($1,$2)", [r, id.ann]));
  await as("pastor", "select approve_member($1,$2)", [r, rec]);
  assert.deepEqual(await root("select id, name_ko, phone from members where user_id=$1", [U.stranger]), [{ id: rec, name_ko: "기존", phone: "777" }]);
  await root("delete from members where id=$1", [rec]);
});

test("prayer visibility and authorship", async () => {
  await as("ann", "insert into prayers(body, visibility, author_id) values ('p','pastor',$1),('g','group',$1),('c','church',$1)", [id.ben]);
  const see = async (n) => (await as(n, "select body from prayers order by body")).map((r) => r.body).join("");
  assert.equal(await see("ann"), "cgp");
  assert.equal(await see("ben"), "c");
  assert.equal(await see("admin"), "c");
  assert.equal(await see("pastor"), "cgp");
  assert.equal((await root("select distinct author_name from prayers"))[0].author_name, "ann");
  await denied(as("ben", "insert into prayers(body, visibility) values ('x','group')"));
  const hidden = (await root("select id from prayers where body='p'"))[0].id;
  await denied(as("ben", "insert into prayer_supports values ($1,$2)", [hidden, id.ben]));
});

test("group posts stay in the group", async () => {
  await as("ann", "insert into group_posts(group_id, body) values ($1,'hi')", [id.g]);
  assert.equal((await as("ben", "select * from group_posts")).length, 0);
  assert.equal((await as("ben", "select * from group_roster($1)", [id.g])).length, 0);
  await denied(as("ben", "insert into group_posts(group_id, body) values ($1,'x')", [id.g]));
});

test("care notes: pastor only, through logged functions", async () => {
  await as("pastor", "select add_care_note($1,'visit','secret',current_date)", [id.ann]);
  for (const n of ["pastor", "admin", "ann"]) await denied(as(n, "select * from care_notes"));
  for (const n of ["admin", "ann"]) {
    await denied(as(n, "select * from read_care_notes($1)", [id.ann]));
    assert.equal((await as(n, "select * from care_reminders()")).length, 0);
  }
  assert.equal((await as("pastor", "select * from read_care_notes($1)", [id.ann]))[0].body, "secret");
  const log = (await as("pastor", "select action from access_log")).map((r) => r.action);
  assert.ok(log.includes("care.add") && log.includes("care.read"));
  assert.equal((await as("admin", "select * from access_log")).length, 0);
  await denied(as("pastor", "delete from access_log"));
});

test("giving: own records only; staff use the logged report", async () => {
  await as("admin", "insert into giving(member_id, given_on, amount) values ($1,'2026-01-04',50),($2,'2026-01-04',70)", [id.ann, id.ben]);
  assert.deepEqual((await as("ann", "select amount::int a from giving")).map((r) => r.a), [50]);
  await denied(as("ann", "insert into giving(member_id, given_on, amount) values ($1,'2026-01-04',5)", [id.ann]));
  await denied(as("ann", "select * from giving_report(2026)"));
  assert.equal((await as("admin", "select * from giving_report(2026)")).length, 2);
  assert.ok((await as("pastor", "select * from access_log where action='giving.read'")).length);
});

test("children: guardians and their household; pickup needs the code", async () => {
  const c = (await as("ann", "insert into children(guardian_id, name) values ($1,'아이') returning id", [id.ann]))[0].id;
  for (const n of ["ben", "admin", "pastor"]) assert.equal((await as(n, "select * from children")).length, 0);
  await denied(as("ben", "insert into children(guardian_id, name) values ($1,'x')", [id.ann]));
  await denied(as("ben", "select * from checkin_roster(current_date)"));
  const code = (await as("admin", "select child_check_in($1,current_date) c", [c]))[0].c;
  assert.equal((await as("ann", "select code from child_checkins"))[0].code, code);
  assert.equal((await as("ben", "select code from child_checkins")).length, 0);
  await denied(as("admin", "select child_check_out($1,current_date,'ZZZZ','x')", [c]));
  await denied(as("ben", "select child_check_out($1,current_date,$2,'x')", [c, code]));
  await as("admin", "select child_check_out($1,current_date,$2,'엄마')", [c, code]);
  const h = (await as("admin", "insert into households(name) values ('h') returning id"))[0].id;
  await as("admin", "update members set household_id=$1 where id in ($2,$3)", [h, id.ann, id.ben]);
  assert.equal((await as("ben", "select * from children")).length, 1);
});

test("rsvp capacity and serving swaps", async () => {
  const e = (await as("admin", "insert into events(title_ko, starts_at, rsvp, capacity) values ('e', now()+interval '1 day', true, 3) returning id"))[0].id;
  await as("ann", "insert into event_rsvps(event_id, member_id, people) values ($1,$2,2)", [e, id.ann]);
  await denied(as("ben", "insert into event_rsvps(event_id, member_id, people) values ($1,$2,2)", [e, id.ben]));
  await denied(as("ben", "insert into event_rsvps(event_id, member_id) values ($1,$2)", [e, id.ann]));
  assert.equal((await as("ben", "select * from event_rsvps")).length, 0);
  assert.equal(Number((await as("ben", "select * from event_counts()"))[0].people), 2);
  const s = (await as("admin", "insert into serving_slots(team, serve_on, member_id) values ('주방', current_date, $1) returning id", [id.ann]))[0].id;
  await denied(as("ben", "select serve_respond($1,'take')", [s]));
  await as("ann", "select serve_respond($1,'swap')", [s]);
  await as("ben", "select serve_respond($1,'take')", [s]);
  assert.equal((await root("select member_name from serving_slots where id=$1", [s]))[0].member_name, "ben");
});

test("absentees: missed the last three services", async () => {
  for (const [d, who] of [["2026-01-04", "ann"], ["2026-01-11", "ben"], ["2026-01-18", "ben"], ["2026-01-25", "ben"]])
    await as("admin", "insert into attendance values ($1,$2)", [d, id[who]]);
  assert.deepEqual((await as("admin", "select name from absentees()")).map((r) => r.name), ["ann"]);
  assert.equal((await as("ben", "select * from absentees()")).length, 0);
});

test("home slides and files: public sees slides, only staff change them", async () => {
  await as("admin", "insert into hero_slides(image_url) values ('x')");
  assert.equal((await as("anon", "select * from hero_slides")).length, 1);
  await denied(as("anon", "insert into hero_slides(image_url) values ('x')"));
  for (const n of ["ann", "pending"]) {
    await denied(as(n, "insert into hero_slides(image_url) values ('x')"));
    await as(n, "delete from hero_slides");
    for (const b of ["hero", "church-files"]) await denied(as(n, "insert into storage.objects(bucket_id, name) values ($1,'x')", [b]));
  }
  assert.equal((await root("select * from hero_slides")).length, 1);
  await as("admin", "insert into storage.objects(bucket_id, name) values ('church-files','x')");
  assert.equal((await as("ann", "select * from storage.objects")).length, 1);
  assert.equal((await as("pending", "select * from storage.objects")).length, 0);
});

test("visit form: anyone can send, staff read, floods stop", async () => {
  for (let i = 0; i < 30; i++) await as("anon", "select submit_visit('v','760-000','')");
  await assert.rejects(as("anon", "select submit_visit('v','760-000','')"), /too many/);
  assert.equal((await as("admin", "select * from visits")).length, 30);
  assert.equal((await as("ann", "select * from visits")).length, 0);
});

test("internal functions can't be called by anyone signed in", async () => {
  await denied(as("ann", "select private.make_pastor('ann@x.test','x')"));
  await denied(as("pastor", "select private.log('x','y')"));
});

test("deactivated members lose access", async () => {
  await as("pastor", "update members set status='inactive' where id=$1", [id.ben]);
  assert.equal((await as("ben", "select * from prayers")).length, 0);
  assert.equal((await as("ben", "select * from children")).length, 0);
  assert.equal((await as("ben", "select * from giving")).length, 0);
});
