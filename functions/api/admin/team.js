import { jsonResponse, verifyAdminToken } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, team: [] });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM team_members ORDER BY display_order ASC, id ASC"
    ).all();
    return jsonResponse({ success: true, team: results || [] });
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
    const { name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order, status } = body;

    if (!name || !role) {
      return jsonResponse({ success: false, error: "Nama dan peranan diperlukan." }, 400);
    }

    const stmt = env.DB.prepare(`
      INSERT INTO team_members (name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name.trim(),
      title || role,
      role.trim(),
      badge_label || title || role,
      phone || '60123456789',
      email || '',
      image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      card_color || 'bg-brand-navy',
      badge_color || 'bg-brand-yellow text-brand-navyDeep',
      parseInt(display_order) || 99,
      status || 'AKTIF'
    );

    const result = await stmt.run();
    return jsonResponse({ success: true, message: "Ahli pasukan berjaya ditambah.", id: result.meta?.last_row_id });
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
    const { id, name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order, status } = body;

    if (!id || !name) {
      return jsonResponse({ success: false, error: "ID dan nama diperlukan." }, 400);
    }

    await env.DB.prepare(`
      UPDATE team_members SET
        name = ?,
        title = ?,
        role = ?,
        badge_label = ?,
        phone = ?,
        email = ?,
        image_url = ?,
        card_color = ?,
        badge_color = ?,
        display_order = ?,
        status = ?
      WHERE id = ?
    `).bind(
      name.trim(),
      title || role,
      role.trim(),
      badge_label || title || role,
      phone || '60123456789',
      email || '',
      image_url || '',
      card_color || 'bg-brand-navy',
      badge_color || 'bg-brand-yellow text-brand-navyDeep',
      parseInt(display_order) || 99,
      status || 'AKTIF',
      id
    ).run();

    return jsonResponse({ success: true, message: "Maklumat staf berjaya dikemaskini." });
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
      return jsonResponse({ success: false, error: "ID staf diperlukan." }, 400);
    }

    await env.DB.prepare("DELETE FROM team_members WHERE id = ?").bind(id).run();
    return jsonResponse({ success: true, message: "Ahli pasukan berjaya dipadam." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
