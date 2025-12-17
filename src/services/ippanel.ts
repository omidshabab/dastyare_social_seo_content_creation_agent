import { env } from "../env";

type SendResult = { outboxIds?: number[] };

export async function sendOtpSms(phone: string, code: string): Promise<SendResult> {
  const url = `${env.ippanelBaseUrl}/api/send`;
  const body = {
    sending_type: "pattern",
    from_number: normalizeOriginator(env.ippanelOriginator),
    code: env.ippanelPatternCode,
    recipients: [normalizeRecipientE164(phone)],
    params: { code }
  };
  try {
    console.log("IPPANEL send start", {
      originator: (body as any).from_number,
      recipients: (body as any).recipients
    });
  } catch {}
  let res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": env.ippanelApiKey
    },
    body: JSON.stringify(body)
  });
  try {
    console.log("IPPANEL send response", { status: res.status });
  } catch {}
  if (!res.ok) {
    let details = "";
    try {
      const err = await res.json();
      details = JSON.stringify(err);
    } catch {
      try {
        details = await res.text();
      } catch {
        details = "";
      }
    }
    try {
      console.error("IPPANEL send error", { status: res.status, details });
    } catch {}
    throw new Error(`IPPANEL_ERROR_${res.status}${details ? `:${details}` : ""}`);
  }
  const data = await res.json().catch(() => ({} as any));
  try {
    console.log("IPPANEL send success", { outboxIds: (data as any)?.data?.message_outbox_ids });
  } catch {}
  return { outboxIds: (data as any)?.data?.message_outbox_ids };
}

function normalizeRecipientE164(p: string) {
  const raw = String(p || "").trim();
  if (raw.startsWith("+98")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  if (digits.startsWith("98")) return `+${digits}`;
  return `+98${digits}`;
}

function normalizeOriginator(o: string) {
  const raw = String(o || "").trim();
  if (raw.startsWith("+98")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  if (digits.startsWith("98")) return `+${digits}`;
  return `+98${digits}`;
}
