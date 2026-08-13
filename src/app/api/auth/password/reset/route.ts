import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { consumeResetToken } from "@/lib/auth/reset-store";
import { createSessionToken, userCookieOptions } from "@/lib/auth/session";
import {
  findUserByEmail,
  toPublic,
  updateUserPassword,
} from "@/lib/auth/users-store";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      token?: string;
      password?: string;
    };

    const email = normalizeEmail(body.email || "");
    const token = (body.token || "").trim();
    const password = body.password || "";

    if (!isValidEmail(email) || !token) {
      return NextResponse.json(
        { error: "Некорректная ссылка восстановления" },
        { status: 400 }
      );
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 7 символов" },
        { status: 400 }
      );
    }

    const ok = await consumeResetToken(email, token);
    if (!ok) {
      return NextResponse.json(
        { error: "Ссылка устарела или уже использована. Запросите новую." },
        { status: 400 }
      );
    }

    const { hash, salt } = await hashPassword(password);
    const updated = await updateUserPassword(email, hash, salt);
    if (!updated) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const publicUser = toPublic(user);
    const session = await createSessionToken(publicUser);
    const res = NextResponse.json({ ok: true, user: publicUser });
    if (session) res.cookies.set(userCookieOptions(session));
    return res;
  } catch (err) {
    console.error("[auth/password/reset]", err);
    return NextResponse.json(
      { error: "Не удалось обновить пароль" },
      { status: 500 }
    );
  }
}