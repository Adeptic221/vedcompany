import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth/phone";
import {
  clearOtp,
  getOtp,
  hashOtpCode,
  setOtp,
} from "@/lib/auth/otp-store";
import { createSessionToken, userCookieOptions } from "@/lib/auth/session";
import { upsertUserByPhone } from "@/lib/auth/users-store";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      code?: string;
      name?: string;
    };

    const phone = normalizePhone(body.phone || "");
    const code = (body.code || "").replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json(
        { error: "Укажите корректный телефон" },
        { status: 400 }
      );
    }
    if (code.length !== 6) {
      return NextResponse.json(
        { error: "Введите 6-значный код из SMS" },
        { status: 400 }
      );
    }

    const otp = await getOtp(phone);
    if (!otp) {
      return NextResponse.json(
        { error: "Сначала запросите код" },
        { status: 400 }
      );
    }
    if (Date.now() > otp.expiresAt) {
      await clearOtp(phone);
      return NextResponse.json(
        { error: "Код истёк. Запросите новый." },
        { status: 400 }
      );
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await clearOtp(phone);
      return NextResponse.json(
        { error: "Слишком много попыток. Запросите новый код." },
        { status: 429 }
      );
    }

    const hash = await hashOtpCode(code);
    if (hash !== otp.codeHash) {
      otp.attempts += 1;
      await setOtp(otp);
      return NextResponse.json(
        { error: "Неверный код" },
        { status: 401 }
      );
    }

    await clearOtp(phone);
    const user = await upsertUserByPhone({
      phone,
      name: body.name,
    });

    const token = await createSessionToken(user);
    if (!token) {
      return NextResponse.json(
        { error: "Не настроен AUTH_SECRET / ADMIN_SECRET на сервере" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ user });
    res.cookies.set(userCookieOptions(token));
    return res;
  } catch (err) {
    console.error("[auth/sms/verify]", err);
    return NextResponse.json(
      { error: "Не удалось подтвердить код" },
      { status: 500 }
    );
  }
}