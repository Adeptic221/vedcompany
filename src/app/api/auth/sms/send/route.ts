import { NextResponse } from "next/server";
import { normalizePhone, maskPhone } from "@/lib/auth/phone";
import {
  getOtp,
  hashOtpCode,
  setOtp,
  type OtpRecord,
} from "@/lib/auth/otp-store";
import { generateOtpCode, sendSmsCode } from "@/lib/auth/sms";

export const dynamic = "force-dynamic";

const RESEND_MS = 60_000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const TTL_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = normalizePhone(body.phone || "");
    if (!phone) {
      return NextResponse.json(
        { error: "Укажите телефон в формате +7 XXX XXX-XX-XX" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const prev = await getOtp(phone);

    if (prev && now - prev.sentAt < RESEND_MS) {
      const wait = Math.ceil((RESEND_MS - (now - prev.sentAt)) / 1000);
      return NextResponse.json(
        { error: `Повторная отправка через ${wait} сек.` },
        { status: 429 }
      );
    }

    let sendCount = 1;
    let windowStart = now;
    if (prev && now - prev.windowStart < WINDOW_MS) {
      sendCount = prev.sendCount + 1;
      windowStart = prev.windowStart;
      if (sendCount > MAX_PER_WINDOW) {
        return NextResponse.json(
          { error: "Слишком много запросов. Попробуйте через час." },
          { status: 429 }
        );
      }
    }

    const code = generateOtpCode();
    const codeHash = await hashOtpCode(code);
    const send = await sendSmsCode(phone, code);
    if (!send.ok) {
      return NextResponse.json(
        { error: send.error || "Не удалось отправить SMS" },
        { status: 502 }
      );
    }

    const record: OtpRecord = {
      phone,
      codeHash,
      expiresAt: now + TTL_MS,
      attempts: 0,
      sentAt: now,
      sendCount,
      windowStart,
    };
    await setOtp(record);

    const payload: Record<string, unknown> = {
      ok: true,
      phoneMasked: maskPhone(phone),
      expiresIn: 300,
      resendIn: 60,
      provider: send.provider,
    };

    // Local/dev helper: show code when SMS provider is not used
    if (send.provider === "dev") {
      payload.devCode = code;
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[auth/sms/send]", err);
    return NextResponse.json(
      { error: "Не удалось отправить код" },
      { status: 500 }
    );
  }
}