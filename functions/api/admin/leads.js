import { jsonResponse, verifyAdminToken } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan. Sila log masuk." }, 401);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  if (!env.DB) {
    return jsonResponse({
      success: true,
      leads: [],
      stats: { total: 0, baru: 0, semakan: 0, lulus: 0, ditolak: 0 },
      note: "Pangkalan data D1 sedang dihubungkan."
    });
  }

  try {
    let query = `
      SELECT l.*, t.name as consultant_name, t.role as consultant_role 
      FROM leads l 
      LEFT JOIN team_members t ON l.assigned_consultant_id = t.id 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "ALL") {
      query += " AND l.status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (l.applicant_name LIKE ? OR l.phone LIKE ? OR l.sector LIKE ? OR l.email LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += " ORDER BY l.id DESC LIMIT 300";

    const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
    const { results } = await stmt.all();

    // Summary stats
    const statsRes = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'BARU' THEN 1 ELSE 0 END) as baru,
        SUM(CASE WHEN status = 'DALAM SEMAKAN' THEN 1 ELSE 0 END) as semakan,
        SUM(CASE WHEN status = 'HANTAR KE BANK' THEN 1 ELSE 0 END) as bank,
        SUM(CASE WHEN status = 'LULUS' THEN 1 ELSE 0 END) as lulus,
        SUM(CASE WHEN status = 'DITOLAK' THEN 1 ELSE 0 END) as ditolak
      FROM leads
    `).first();

    return jsonResponse({
      success: true,
      leads: results || [],
      stats: statsRes || { total: 0, baru: 0, semakan: 0, bank: 0, lulus: 0, ditolak: 0 }
    });
  } catch (err) {
    return jsonResponse({ success: false, error: "Ralat pangkalan data: " + err.message }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: "Pangkalan data D1 tiada." }, 500);
  }

  try {
    const body = await request.json();
    const { id, status, notes, assigned_consultant_id } = body;

    if (!id) {
      return jsonResponse({ success: false, error: "ID permohonan diperlukan." }, 400);
    }

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }
    if (assigned_consultant_id !== undefined) {
      updates.push("assigned_consultant_id = ?");
      params.push(assigned_consultant_id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    const query = `UPDATE leads SET ${updates.join(", ")} WHERE id = ?`;
    await env.DB.prepare(query).bind(...params).run();

    return jsonResponse({ success: true, message: "Permohonan berjaya dikemaskini." });
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
      return jsonResponse({ success: false, error: "ID permohonan diperlukan." }, 400);
    }

    await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
    return jsonResponse({ success: true, message: "Permohonan berjaya dipadam." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
