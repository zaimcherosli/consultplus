import { jsonResponse } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return jsonResponse({ success: true, team: [] });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order FROM team_members WHERE status = 'AKTIF' ORDER BY display_order ASC, id ASC"
    ).all();
    return jsonResponse({ success: true, team: results || [] });
  } catch (e) {
    return jsonResponse({ success: false, error: e.message }, 500);
  }
}
