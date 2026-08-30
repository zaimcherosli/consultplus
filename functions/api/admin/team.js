import { jsonResponse, verifyAdminToken } from "../_utils.js";

const DEFAULT_TEAM = [
  { id: 1, name: "Tn. Zaim Rosli", title: "CEO & Pengasas", role: "Ketua Eksekutif", badge_label: "CEO & Pengasas", image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-yellow", display_order: 1, status: "AKTIF" },
  { id: 2, name: "Pn. Faridah", title: "Pengurus Risiko", role: "Credit Manager", badge_label: "Pengurus Risiko", image_url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navy", display_order: 2, status: "AKTIF" },
  { id: 3, name: "Pn. Sarah", title: "Pengarah Urusan", role: "Managing Director", badge_label: "Pengarah Urusan", image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navyDeep", display_order: 3, status: "AKTIF" },
  { id: 4, name: "En. Amirul", title: "Ketua SME", role: "SME Financing Lead", badge_label: "Ketua SME", image_url: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-blueAccent", display_order: 4, status: "AKTIF" },
  { id: 5, name: "En. Razif", title: "Hubungan Bank", role: "Banking Relations Lead", badge_label: "Hubungan Bank", image_url: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navy", display_order: 5, status: "AKTIF" },
  { id: 6, name: "Cik Aina", title: "Pakar Refinance", role: "Mortgage Lead", badge_label: "Pakar Refinance", image_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-yellow", display_order: 6, status: "AKTIF" }
];

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  if (env.CONSULTPLUS_KV) {
    try {
      const data = await env.CONSULTPLUS_KV.get("team_members", "json");
      if (data && Array.isArray(data) && data.length > 0) {
        return jsonResponse({ success: true, team: data });
      }
    } catch (e) {}
  }

  return jsonResponse({ success: true, team: DEFAULT_TEAM });
}

export async function onRequestPost({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  try {
    const body = await request.json();
    let team = [...DEFAULT_TEAM];
    if (env.CONSULTPLUS_KV) {
      const kvData = await env.CONSULTPLUS_KV.get("team_members", "json");
      if (kvData && Array.isArray(kvData)) team = kvData;
    }

    const newItem = {
      id: Date.now(),
      name: (body.name || '').trim(),
      badge_label: body.badge_label || body.title || '',
      title: body.badge_label || body.title || '',
      role: (body.role || '').trim(),
      display_order: parseInt(body.display_order) || team.length + 1,
      phone: body.phone || '60123456789',
      card_color: body.card_color || 'bg-brand-yellow',
      image_url: body.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      status: 'AKTIF'
    };

    team.push(newItem);
    team.sort((a, b) => (parseInt(a.display_order) || 0) - (parseInt(b.display_order) || 0));

    if (env.CONSULTPLUS_KV) {
      await env.CONSULTPLUS_KV.put("team_members", JSON.stringify(team));
    }

    return jsonResponse({ success: true, message: "Ahli pasukan berjaya ditambah.", team });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  try {
    const body = await request.json();
    const id = parseInt(body.id);
    let team = [...DEFAULT_TEAM];

    if (env.CONSULTPLUS_KV) {
      const kvData = await env.CONSULTPLUS_KV.get("team_members", "json");
      if (kvData && Array.isArray(kvData) && kvData.length > 0) team = kvData;
    }

    const idx = team.findIndex(x => x.id === id);
    if (idx >= 0) {
      team[idx] = {
        ...team[idx],
        name: body.name !== undefined ? body.name : team[idx].name,
        badge_label: body.badge_label !== undefined ? body.badge_label : team[idx].badge_label,
        title: body.badge_label !== undefined ? body.badge_label : (body.title || team[idx].title),
        role: body.role !== undefined ? body.role : team[idx].role,
        display_order: body.display_order !== undefined ? parseInt(body.display_order) : team[idx].display_order,
        phone: body.phone !== undefined ? body.phone : team[idx].phone,
        card_color: body.card_color !== undefined ? body.card_color : team[idx].card_color,
        image_url: body.image_url !== undefined ? body.image_url : team[idx].image_url,
        status: body.status !== undefined ? body.status : 'AKTIF'
      };
    } else {
      team.push({ id, ...body });
    }

    team.sort((a, b) => (parseInt(a.display_order) || 0) - (parseInt(b.display_order) || 0));

    if (env.CONSULTPLUS_KV) {
      await env.CONSULTPLUS_KV.put("team_members", JSON.stringify(team));
    }

    return jsonResponse({ success: true, message: "Maklumat staf & gambar berjaya disimpan.", team });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!verifyAdminToken(request)) {
    return jsonResponse({ success: false, error: "Akses tidak dibenarkan." }, 401);
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id"));

    let team = [...DEFAULT_TEAM];
    if (env.CONSULTPLUS_KV) {
      const kvData = await env.CONSULTPLUS_KV.get("team_members", "json");
      if (kvData && Array.isArray(kvData)) team = kvData;
    }

    team = team.filter(x => x.id !== id);

    if (env.CONSULTPLUS_KV) {
      await env.CONSULTPLUS_KV.put("team_members", JSON.stringify(team));
    }

    return jsonResponse({ success: true, message: "Ahli pasukan berjaya dipadam.", team });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
