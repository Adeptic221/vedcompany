import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/session";

export {
  ADMIN_COOKIE,
  getAdminSecret,
  getAdminSessionToken,
  verifyAdminToken,
  adminCookieOptions,
} from "@/lib/admin/session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
