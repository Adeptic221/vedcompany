export type SendEmailResult =
  | { ok: true; provider: "resend" | "dev" }
  | { ok: false; error: string };

function appBaseUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://vedcompany.ru"
  ).replace(/\/$/, "");
}

export function getAppBaseUrl(): string {
  return appBaseUrl();
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "VED Services <noreply@vedcompany.ru>";

  if (!apiKey) {
    console.info("[email:dev]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true, provider: "dev" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email:resend]", res.status, body.slice(0, 300));
      return { ok: false, error: "Не удалось отправить письмо" };
    }
    return { ok: true, provider: "resend" };
  } catch (err) {
    console.error("[email:resend]", err);
    return { ok: false, error: "Не удалось отправить письмо" };
  }
}

export function passwordResetEmail(link: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Восстановление пароля — VED Services";
  const text = `Вы запросили сброс пароля для личного кабинета VED.\n\nОткройте ссылку (действует 1 час):\n${link}\n\nЕсли это были не вы — просто проигнорируйте письмо.`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#122">
      <h1 style="font-weight:normal;font-size:22px">Восстановление пароля</h1>
      <p>Вы запросили сброс пароля для личного кабинета VED Services.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#0b1c33;color:#fff;text-decoration:none">Задать новый пароль</a></p>
      <p style="font-size:13px;color:#555">Ссылка действует 1 час. Если кнопка не открывается:<br/><a href="${link}">${link}</a></p>
      <p style="font-size:13px;color:#777">Если это были не вы — просто проигнорируйте письмо.</p>
    </div>
  `;
  return { subject, html, text };
}