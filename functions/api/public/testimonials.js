import { jsonResponse } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return jsonResponse({ success: true, testimonials: [] });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, client_name, profession, original_issue, loan_approved, monthly_savings, story, is_featured, display_order FROM testimonials WHERE is_featured = 1 ORDER BY display_order ASC, id DESC"
    ).all();
    return jsonResponse({ success: true, testimonials: results || [] });
  } catch (e) {
    return jsonResponse({ success: false, error: e.message }, 500);
  }
}
