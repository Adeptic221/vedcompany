import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, userCookieOptions } from "@/lib/auth/session";
import { createUser } from "@/lib/auth/users-store";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Укажите корректный email" },
        { status: 400 }
      );
    }
    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Имя должно быть не короче 2 символов" },
        { status: 400 }
      );
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 7 символов" },
        { status: 400 }
      );
    }

    const { hash, salt } = await hashPassword(password);
    const user = await createUser({
      email,
      name,
      phone,
      passwordHash: hash,
      passwordSalt: salt,
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
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "Этот email уже зарегистрирован" },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "PHONE_TAKEN") {
      return NextResponse.json(
        { error: "Этот телефон уже зарегистрирован" },
        { status: 409 }
      );
    }
    console.error("[auth/register]", err);
    return NextResponse.json(
      { error: "Не удалось зарегистрироваться" },
      { status: 500 }
    );
  }
}