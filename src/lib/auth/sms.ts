export type SmsSendResult = {
  ok: boolean;
  provider: "smsru" | "dev" | "none";
  error?: string;
};

type SmsRuResponse = {
  status?: string;
  status_code?: number;
  status_text?: string;
  sms?: Record<
    string,
    {
      status?: string;
      status_code?: number;
      status_text?: string;
    }
  >;
};

export async function sendSmsCode(
  phone: string,
  code: string
): Promise<SmsSendResult> {
  const apiId = process.env.SMS_RU_API_ID?.trim();
  const devMode = process.env.SMS_DEV_MODE === "1";
  const from = process.env.SMS_RU_FROM?.trim();

  // Explicit dev mode: never call SMS.ru (useful for local tests)
  if (devMode || !apiId) {
    if (!apiId && process.env.NODE_ENV === "production") {
      return {
        ok: false,
        provider: "none",
        error: "SMS provider is not configured (SMS_RU_API_ID)",
      };
    }
    console.info(`[sms:dev] ${phone} => ${code}`);
    return { ok: true, provider: "dev" };
  }

  const text = `VED: код входа ${code}. Действителен 5 минут.`;
  const to = phone.replace(/\D/g, "");

  try {
    const body = new URLSearchParams();
    body.set("api_id", apiId);
    body.set("to", to);
    body.set("msg", text);
    body.set("json", "1");
    if (from) body.set("from", from);

    const res = await fetch("https://sms.ru/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    const data = (await res.json()) as SmsRuResponse;
    if (data.status === "OK" || data.status_code === 100) {
      const smsInfo = data.sms?.[to];
      if (
        smsInfo &&
        smsInfo.status === "ERROR" &&
        typeof smsInfo.status_code === "number" &&
        smsInfo.status_code >= 200
      ) {
        return {
          ok: false,
          provider: "smsru",
          error: smsInfo.status_text || `SMS.ru code ${smsInfo.status_code}`,
        };
      }
      return { ok: true, provider: "smsru" };
    }

    return {
      ok: false,
      provider: "smsru",
      error: data.status_text || `SMS.ru error ${data.status_code ?? ""}`.trim(),
    };
  } catch (err) {
    console.error("[sms] SMS.ru failed:", err);
    return { ok: false, provider: "smsru", error: "SMS send failed" };
  }
}

export function generateOtpCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}