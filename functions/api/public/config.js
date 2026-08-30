import { jsonResponse } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ env }) {
  const defaultSettings = {
    whatsapp_number: "60123456789",
    phone_display: "+6012-345 6789",
    email: "support@consultplus.my",
    office_hours: "Isnin - Jumaat: 9:00 AM - 6:00 PM",
    min_interest_rate: "2.95%",
    max_loan_amount: "RM300,000",
    announcement_text: "100% Panel Bank Berlesen | Tiada Caj Wang Pendahuluan | Kelulusan 24-48 Jam",
    announcement_active: "1"
  };

  if (!env.DB) {
    return jsonResponse({ success: true, config: defaultSettings });
  }

  try {
    const { results } = await env.DB.prepare("SELECT key, value FROM site_settings").all();
    const configMap = { ...defaultSettings };
    for (const r of (results || [])) {
      configMap[r.key] = r.value;
    }
    return jsonResponse({ success: true, config: configMap });
  } catch (e) {
    return jsonResponse({ success: true, config: defaultSettings });
  }
}
