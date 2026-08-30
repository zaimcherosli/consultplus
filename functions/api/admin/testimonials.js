import { jsonResponse, verifyAdminToken } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, testimonials: [] });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM testimonials ORDER BY display_order ASC, id DESC"
    ).all();
    return jsonResponse({ success: true, testimonials: results || [] });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: "Pangkalan data D1 tiada." }, 500);
  }

  try {
    const body = await request.json();
    const { client_name, profession, original_issue, loan_approved, monthly_savings, story, is_featured, display_order } = body;

    if (!client_name || !loan_approved) {
      return jsonResponse({ success: false, error: "Nama klien dan jumlah pembiayaan diperlukan." }, 400);
    }

    const stmt = env.DB.prepare(`
      INSERT INTO testimonials (client_name, profession, original_issue, loan_approved, monthly_savings, story, is_featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      client_name.trim(),
      profession || 'Klien ConsultPlus',
      original_issue || 'Penstrukturan Pembiayaan',
      loan_approved.trim(),
      monthly_savings || '',
      story || '',
      is_featured !== undefined ? is_featured : 1,
      parseInt(display_order) || 99
    );

    const res = await stmt.run();
    return jsonResponse({ success: true, message: "Testimoni berjaya ditambah.", id: res.meta?.last_row_id });
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
    const { id, client_name, profession, original_issue, loan_approved, monthly_savings, story, is_featured, display_order } = body;

    if (!id || !client_name) {
      return jsonResponse({ success: false, error: "ID dan nama klien diperlukan." }, 400);
    }

    await env.DB.prepare(`
      UPDATE testimonials SET
        client_name = ?,
        profession = ?,
        original_issue = ?,
        loan_approved = ?,
        monthly_savings = ?,
        story = ?,
        is_featured = ?,
        display_order = ?
      WHERE id = ?
    `).bind(
      client_name.trim(),
      profession || '',
      original_issue || '',
      loan_approved.trim(),
      monthly_savings || '',
      story || '',
      is_featured !== undefined ? is_featured : 1,
      parseInt(display_order) || 99,
      id
    ).run();

    return jsonResponse({ success: true, message: "Testimoni berjaya dikemaskini." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: "Pangkalan data D1 tiada." }, 500);
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return jsonResponse({ success: false, error: "ID testimoni diperlukan." }, 400);
    }

    await env.DB.prepare("DELETE FROM testimonials WHERE id = ?").bind(id).run();
    return jsonResponse({ success: true, message: "Testimoni berjaya dipadam." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
