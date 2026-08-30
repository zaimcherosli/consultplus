import { jsonResponse } from "../_utils.js";

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
    display_order: 1
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
    display_order: 2
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
    display_order: 3
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
    display_order: 4
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
    display_order: 5
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
    display_order: 6
  }
];

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return jsonResponse({ success: true, team: DEFAULT_TEAM });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order FROM team_members WHERE status = 'AKTIF' ORDER BY display_order ASC, id ASC"
    ).all();

    if (!results || results.length === 0) {
      return jsonResponse({ success: true, team: DEFAULT_TEAM });
    }

    return jsonResponse({ success: true, team: results });
  } catch (e) {
    return jsonResponse({ success: true, team: DEFAULT_TEAM });
  }
}
