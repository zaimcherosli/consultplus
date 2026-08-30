import { jsonResponse, verifyAdminToken, sha256 } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
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
    const { current_password, new_password, full_name, username } = body;

    const user = await env.DB.prepare("SELECT * FROM admins WHERE username = ?").bind(username || "admin").first();
    if (!user) {
      return jsonResponse({ success: false, error: "Pengguna admin tidak dijumpai." }, 404);
    }

    if (new_password) {
      if (!current_password) {
        return jsonResponse({ success: false, error: "Sila masukkan kata laluan semasa." }, 400);
      }
      const hashedCurrent = await sha256(current_password);
      if (user.password_hash !== hashedCurrent && user.password_hash !== current_password) {
        return jsonResponse({ success: false, error: "Kata laluan semasa tidak tepat." }, 400);
      }

      const hashedNew = await sha256(new_password);
      await env.DB.prepare("UPDATE admins SET password_hash = ?, full_name = COALESCE(?, full_name) WHERE id = ?")
        .bind(hashedNew, full_name || null, user.id).run();
    } else if (full_name) {
      await env.DB.prepare("UPDATE admins SET full_name = ? WHERE id = ?")
        .bind(full_name, user.id).run();
    }

    return jsonResponse({ success: true, message: "Profil admin berjaya dikemaskini." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
