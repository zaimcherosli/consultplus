import { jsonResponse } from "../_utils.js";

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    let { applicant_name, phone, email, sector, salary, loan_amount, loan_purpose, credit_issues, source } = body;

    if (!applicant_name || !phone) {
      return jsonResponse({ success: false, error: "Sila lengkapkan nama penuh dan nombor telefon." }, 400);
    }

    // Clean phone number (strip dashes, spaces)
    let cleanPhone = String(phone).replace(/[^0-9+]/g, "").trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "60" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.substring(1);
    }

    let leadId = null;

    if (env.DB) {
      const stmt = env.DB.prepare(`
        INSERT INTO leads (applicant_name, phone, email, sector, salary, loan_amount, loan_purpose, credit_issues, status, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'BARU', ?)
      `).bind(
        applicant_name.trim(),
        cleanPhone,
        email ? email.trim() : '',
        sector || 'swasta',
        salary ? String(salary).trim() : '',
        loan_amount ? String(loan_amount).trim() : '',
        loan_purpose || 'Penyatuan Hutang',
        credit_issues || '',
        source || 'Borang Semakan Kelayakan'
      );

      const res = await stmt.run();
      leadId = res.meta?.last_row_id;
    }

    return jsonResponse({
      success: true,
      message: "Permohonan semakan kelayakan anda telah berjaya dihantar. Pegawai perunding ConsultPlus akan menghubungi anda melalui WhatsApp sebentar lagi!",
      lead_id: leadId
    });
  } catch (err) {
    return jsonResponse({ success: false, error: "Ralat penghantaran borang: " + err.message }, 500);
  }
}
