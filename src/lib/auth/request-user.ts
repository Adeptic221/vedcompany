import { cookies } from "next/headers";
import { USER_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function getRequestUser() {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(USER_COOKIE)?.value);
  if (!session) return null;
  return {
    id: session.sub,
    email: session.email,
    name: session.name,
    phone: session.phone,
  };
}