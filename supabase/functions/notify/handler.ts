// Emails the pastor about a new request, and the member once approved.
// Called by a database webhook on public.members (insert and update).
type Row = { status: string; name_ko: string; email: string | null; user_id: string | null };
export type Config = { secret?: string; resendKey?: string; from?: string; pastor?: string; site?: string };

export async function handle(req: Request, c: Config, send: typeof fetch = fetch): Promise<Response> {
  if (!c.secret || req.headers.get("x-webhook-secret") !== c.secret) return new Response("forbidden", { status: 403 });
  const { type, record, old_record } = (await req.json()) as { type: string; record: Row | null; old_record: Row | null };

  let mail: { to: string; subject: string; text: string } | null = null;
  if (type === "INSERT" && record?.status === "pending" && c.pastor)
    mail = {
      to: c.pastor,
      subject: "새 교인 등록 신청 / New member request",
      text: `${record.name_ko} 님이 승인을 기다리고 있습니다.\nA new request is waiting for your approval.\n\n${c.site}/admin/`,
    };
  else if (type === "UPDATE" && record?.status === "active" && record.email && record.user_id &&
      (old_record?.status === "pending" || !old_record?.user_id))
    mail = {
      to: record.email,
      subject: "엘센트로 한인교회 등록이 승인되었습니다 / You're approved",
      text: `${record.name_ko} 님, 환영합니다! 이제 로그인하실 수 있습니다.\nWelcome! You can now sign in.\n\n${c.site}/my/`,
    };
  if (!mail) return new Response("nothing to send");

  const res = await send("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${c.resendKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: c.from, ...mail }),
  });
  return new Response(res.ok ? "sent" : "mail failed", { status: res.ok ? 200 : 502 });
}
