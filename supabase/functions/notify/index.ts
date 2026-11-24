import { handle } from "./handler.ts";

Deno.serve((req) =>
  handle(req, {
    secret: Deno.env.get("WEBHOOK_SECRET"),
    resendKey: Deno.env.get("RESEND_API_KEY"),
    from: Deno.env.get("MAIL_FROM"),
    pastor: Deno.env.get("PASTOR_EMAIL"),
    site: Deno.env.get("SITE_URL"),
  })
);
