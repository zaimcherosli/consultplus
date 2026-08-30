import { jsonResponse, sha256 } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return jsonResponse({ success: false, error: "Sila masukkan username dan kata laluan." }, 400);
    }

    const hashedInput = await sha256(password);
    let matchedUser = null;

    if (env.DB) {
      try {
        const user = await env.DB.prepare(
          "SELECT id, username, password_hash, full_name, role FROM admins WHERE username = ?"
        ).bind(username.trim()).first();

        if (user && (user.password_hash === hashedInput || user.password_hash === password)) {
          matchedUser = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
          };
        }
      } catch (err) {
        console.error("D1 Auth Error:", err);
      }
    }

    // Default fallback if DB is initializing or matches default admin
    const defaultHash = "660e512b6206f70ee837a9f2e5f52822903052edc594ef59b7937cb0a6615eb4"; // ConsultPlus2026!
    if (!matchedUser && username.trim().toLowerCase() === "admin" && (hashedInput === defaultHash || password === "ConsultPlus2026!")) {
      matchedUser = {
        id: 1,
        username: "admin",
        full_name: "Admin ConsultPlus",
        role: "superadmin"
      };
    }

    if (!matchedUser) {
      return jsonResponse({ success: false, error: "Username atau kata laluan tidak sah." }, 401);
    }

    const randomSuffix = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const token = `cp_admin_${randomSuffix}`;

    return jsonResponse({
      success: true,
      token,
      user: matchedUser
    });
  } catch (e) {
    return jsonResponse({ success: false, error: "Ralat pemprosesan pelayan: " + e.message }, 500);
  }
}
