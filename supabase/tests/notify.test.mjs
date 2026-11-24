import assert from "node:assert/strict";
import { test } from "node:test";
import { handle } from "../functions/notify/handler.ts";
import { churchTimeToIso, isoToChurchTime } from "../../src/lib/church-time.ts";

const config = { secret: "s", resendKey: "k", from: "f@x.test", pastor: "p@x.test", site: "https://x.test" };
async function call(body, secret = "s") {
  const sent = [];
  const req = new Request("https://x.test", { method: "POST", headers: { "x-webhook-secret": secret }, body: JSON.stringify(body) });
  const res = await handle(req, config, async (_u, o) => (sent.push(JSON.parse(o.body)), new Response("{}")));
  return { status: res.status, to: sent.map((m) => m.to) };
}
const row = (status, user_id = "u") => ({ status, name_ko: "이름", email: "m@x.test", user_id });

test("notify: right person, right moment, right secret", async () => {
  assert.deepEqual(await call({ type: "INSERT", record: row("pending") }), { status: 200, to: ["p@x.test"] });
  assert.deepEqual((await call({ type: "UPDATE", record: row("active"), old_record: row("pending") })).to, ["m@x.test"]);
  assert.deepEqual((await call({ type: "UPDATE", record: row("active"), old_record: row("active", null) })).to, ["m@x.test"]);
  assert.deepEqual((await call({ type: "UPDATE", record: row("active"), old_record: row("active") })).to, []);
  assert.deepEqual((await call({ type: "INSERT", record: row("active") })).to, []);
  assert.deepEqual(await call({ type: "INSERT", record: row("pending") }, "wrong"), { status: 403, to: [] });
});

test("church time round-trips in winter, summer and around the clock change", () => {
  assert.equal(churchTimeToIso("2026-12-25T09:00"), "2026-12-25T17:00:00.000Z");
  assert.equal(churchTimeToIso("2026-07-05T09:00"), "2026-07-05T16:00:00.000Z");
  for (const t of ["2026-03-08T01:30", "2026-03-08T03:30", "2026-11-01T00:30", "2026-11-01T02:30"])
    assert.equal(isoToChurchTime(churchTimeToIso(t)), t);
});
