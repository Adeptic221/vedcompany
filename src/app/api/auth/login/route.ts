import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, userCookieOptions } from "@/lib/auth/session";
import { findUserByEmail, toPublic } from "@/lib/auth/users-store";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/auth/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = normalizeEmail(body.email || "");
    const password = body.password || "";

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    if (!user.passwordHash || !user.passwordSalt) {
      return NextResponse.json(
        { error: "Этот аккаунт входит по SMS. Выберите вкладку SMS." },
        { status: 400 }
      );
    }

    const ok = await verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const publicUser = toPublic(user);
    const token = await createSessionToken(publicUser);
    if (!token) {
      return NextResponse.json(
        { error: "Не настроен AUTH_SECRET / ADMIN_SECRET на сервере" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ user: publicUser });
    res.cookies.set(userCookieOptions(token));
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}