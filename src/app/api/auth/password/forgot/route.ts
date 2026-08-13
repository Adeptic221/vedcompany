import { NextResponse } from "next/server";
import {
  getAppBaseUrl,
  passwordResetEmail,
  sendEmail,
} from "@/lib/auth/email";
import {
  createResetToken,
  saveResetToken,
} from "@/lib/auth/reset-store";
import { findUserByEmail } from "@/lib/auth/users-store";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validate";

export const dynamic = "force-dynamic";

const GENERIC_OK =
  "Если аккаунт с таким email есть, мы отправили ссылку для восстановления.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Укажите корректный email" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    // Always respond the same way (no email enumeration).
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: true, message: GENERIC_OK });
    }

    const token = createResetToken();
    await saveResetToken(email, token);
    const origin =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin ||
      getAppBaseUrl();
    const link = `${origin.replace(/\/$/, "")}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const mail = passwordResetEmail(link);
    const sent = await sendEmail({ to: email, ...mail });

    if (!sent.ok) {
      return NextResponse.json(
        { error: sent.error || "Не удалось отправить письмо" },
        { status: 502 }
      );
    }

    const payload: {
      ok: true;
      message: string;
      devResetUrl?: string;
    } = { ok: true, message: GENERIC_OK };

    if (sent.provider === "dev") {
      payload.devResetUrl = link;
      payload.message =
        "Режим разработки: письмо не отправлено. Используйте ссылку ниже.";
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[auth/password/forgot]", err);
    return NextResponse.json(
      { error: "Не удалось обработать запрос" },
      { status: 500 }
    );
  }
}