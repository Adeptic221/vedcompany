import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const configured = Boolean(process.env.RESEND_API_KEY);
  return NextResponse.json({
    resendConfigured: configured,
    from: process.env.EMAIL_FROM || "VED Services <noreply@vedcompany.ru>",
    appUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://vedcompany.ru",
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hint: configured
      ? "Письма восстановления пароля уходят через Resend."
      : "Добавьте RESEND_API_KEY (и EMAIL_FROM, APP_URL) в Vercel → Environment Variables.",
  });
}