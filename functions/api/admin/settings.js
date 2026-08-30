import { jsonResponse, verifyAdminToken } from "../_utils.js";

const DEFAULT_SETTINGS = {
  whatsapp_number: "601171191170",
  phone_display: "+6011-7119 1170",
  email: "support@consultplus.my",
  office_hours: "Isnin - Jumaat: 9:00 AM - 6:00 PM",
  min_interest_rate: "2.95%",
  max_loan_amount: "RM300,000",
  announcement_text: "100% Panel Bank Berlesen | Tiada Caj Wang Pendahuluan | Kelulusan 24-48 Jam",
  announcement_active: "1"
};

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (env.CONSULTPLUS_KV) {
    try {
      const kvData = await env.CONSULTPLUS_KV.get("site_settings", "json");
      if (kvData && typeof kvData === 'object') {
        return jsonResponse({ success: true, settings: { ...DEFAULT_SETTINGS, ...kvData } });
      }
    } catch (e) {}
  }

  return jsonResponse({ success: true, settings: DEFAULT_SETTINGS });
}

export async function onRequestPut({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  try {
    const body = await request.json();
    let currentSettings = { ...DEFAULT_SETTINGS };

    if (env.CONSULTPLUS_KV) {
      const kvData = await env.CONSULTPLUS_KV.get("site_settings", "json");
      if (kvData && typeof kvData === 'object') currentSettings = { ...currentSettings, ...kvData };
    }

    const updated = { ...currentSettings, ...body };

    if (env.CONSULTPLUS_KV) {
      await env.CONSULTPLUS_KV.put("site_settings", JSON.stringify(updated));
    }

    return jsonResponse({ success: true, message: "Semua tetapan web & WhatsApp berjaya disimpan!", settings: updated });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
