import { jsonResponse, verifyAdminToken } from "../_utils.js";

const DEFAULT_TEAM = [
  {
    id: 1,
    name: "Tn. Zaim Rosli",
    title: "CEO & Pengasas",
    role: "Ketua Eksekutif",
    badge_label: "CEO & Pengasas",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-yellow",
    badge_color: "bg-brand-navyDeep text-brand-yellow",
    display_order: 1,
    status: "AKTIF"
  },
  {
    id: 2,
    name: "Pn. Faridah",
    title: "Pengurus Risiko",
    role: "Credit Manager",
    badge_label: "Pengurus Risiko",
    image_url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-navy",
    badge_color: "bg-brand-yellow text-brand-navyDeep",
    display_order: 2,
    status: "AKTIF"
  },
  {
    id: 3,
    name: "Pn. Sarah",
    title: "Pengarah Urusan",
    role: "Managing Director",
    badge_label: "Pengarah Urusan",
    image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-navyDeep",
    badge_color: "bg-brand-yellow text-brand-navyDeep",
    display_order: 3,
    status: "AKTIF"
  },
  {
    id: 4,
    name: "En. Amirul",
    title: "Ketua SME",
    role: "SME Financing Lead",
    badge_label: "Ketua SME",
    image_url: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-blueAccent",
    badge_color: "bg-brand-navy text-white",
    display_order: 4,
    status: "AKTIF"
  },
  {
    id: 5,
    name: "En. Razif",
    title: "Hubungan Bank",
    role: "Banking Relations Lead",
    badge_label: "Hubungan Bank",
    image_url: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-navy",
    badge_color: "bg-brand-yellow text-brand-navyDeep",
    display_order: 5,
    status: "AKTIF"
  },
  {
    id: 6,
    name: "Cik Aina",
    title: "Pakar Refinance",
    role: "Mortgage Lead",
    badge_label: "Pakar Refinance",
    image_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80",
    card_color: "bg-brand-yellow",
    badge_color: "bg-brand-navyDeep text-white",
    display_order: 6,
    status: "AKTIF"
  }
];

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, team: DEFAULT_TEAM });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM team_members ORDER BY display_order ASC, id ASC"
    ).all();

    if (!results || results.length === 0) {
      return jsonResponse({ success: true, team: DEFAULT_TEAM });
    }

    return jsonResponse({ success: true, team: results });
  } catch (err) {
    return jsonResponse({ success: true, team: DEFAULT_TEAM });
  }
}

export async function onRequestPost({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, message: "Mod Pratonton: Ahli pasukan disimpan sementara." });
  }

  try {
    const body = await request.json();
    const { name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order, status } = body;

    if (!name || !role) {
      return jsonResponse({ success: false, error: "Nama dan jawatan diperlukan." }, 400);
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
    return jsonResponse({ success: true, message: "Mod Pratonton: Maklumat berjaya dikemaskini." });
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

    return jsonResponse({ success: true, message: "Maklumat staf & gambar berjaya dikemaskini." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: true, message: "Ahli pasukan berjaya dipadam." });
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
