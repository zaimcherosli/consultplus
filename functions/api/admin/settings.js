import { jsonResponse, verifyAdminToken } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, settings: {} });
  }

  try {
    const { results } = await env.DB.prepare("SELECT key, value, description FROM site_settings").all();
    const settingsMap = {};
    for (const r of (results || [])) {
      settingsMap[r.key] = r.value;
    }
    return jsonResponse({ success: true, settings: settingsMap, raw: results });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: "Pangkalan data D1 tiada." }, 500);
  }

  try {
    const body = await request.json();
    const { settings } = body; // object of { key: value }

    if (!settings || typeof settings !== 'object') {
      return jsonResponse({ success: false, error: "Data tetapan tidak sah." }, 400);
    }

    const stmts = [];
    for (const [key, value] of Object.entries(settings)) {
      stmts.push(
        env.DB.prepare(
          "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
        ).bind(key, String(value))
      );
    }

    if (stmts.length > 0) {
      await env.DB.batch(stmts);
    }

    return jsonResponse({ success: true, message: "Tetapan web berjaya dikemaskini." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
