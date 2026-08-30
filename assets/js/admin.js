/**
 * ConsultPlus Admin CMS Interactive Controller (White / Light Theme)
 * Handles Auth, Leads CRM, Agents CRUD, Testimonials & Settings
 */

const API_BASE = '/api';
let authToken = localStorage.getItem('cp_admin_token') || '';
let currentUser = JSON.parse(localStorage.getItem('cp_admin_user') || 'null');
let currentLeads = [];
let currentCareer = [];
let currentAgents = [];
let currentTestimonials = [];

const WHATSAPP_SVG = `<svg class="w-3.5 h-3.5 fill-current text-[#25D366] inline-block shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.564 1.724.814 2.796.814 3.18 0 5.767-2.588 5.767-5.766.001-3.182-2.585-5.77-5.767-5.77zm3.364 8.163c-.144.405-.837.774-1.17.825-.313.05-.725.09-2.072-.472-1.614-.672-2.656-2.316-2.736-2.423-.08-.107-.649-.864-.649-1.649 0-.784.408-1.171.553-1.332.145-.16.319-.2.425-.2.106 0 .213 0 .307.006.1.006.234-.038.365.281.135.327.464 1.132.505 1.215.041.083.069.18.014.288-.055.109-.083.176-.164.271-.082.096-.172.214-.246.287-.082.083-.169.173-.072.339.096.166.428.706.918 1.142.631.562 1.162.736 1.328.819.166.082.263.072.36-.041.097-.113.417-.487.528-.654.111-.167.222-.139.373-.083.152.056.963.454 1.129.537.166.083.277.125.318.194.042.069.042.402-.102.807z"/></svg>`;

document.addEventListener('DOMContentLoaded', () => {
  initAuthFlow();
  initTabs();
  initLeadsListeners();
  initCareerListeners();
  initSettingsListeners();
  setupImageFileInput();
});

// ================= 1. AUTHENTICATION =================
function initAuthFlow() {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (authToken && currentUser) {
    showDashboard();
  } else {
    showLogin();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const alertBox = document.getElementById('login-alert');
      const btn = document.getElementById('login-btn');

      btn.disabled = true;
      btn.innerHTML = '<span>Sedang log masuk...</span>';
      alertBox.classList.add('hidden');

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('cp_admin_token', authToken);
          localStorage.setItem('cp_admin_user', JSON.stringify(currentUser));
          showDashboard();
        } else {
          alertBox.textContent = data.error || 'Gagal log masuk.';
          alertBox.className = 'p-3.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
          alertBox.classList.remove('hidden');
        }
      } catch (err) {
        alertBox.textContent = 'Ralat sambungan ke pelayan.';
        alertBox.className = 'p-3.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
        alertBox.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Log Masuk Panel</span>';
      }
    });
  }

  const doLogout = () => {
    localStorage.removeItem('cp_admin_token');
    localStorage.removeItem('cp_admin_user');
    authToken = '';
    currentUser = null;
    showLogin();
  };

  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', doLogout);
}

function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('dashboard-view').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  if (currentUser) {
    const name = currentUser.full_name || currentUser.username;
    const userDisplay = document.getElementById('user-display');
    const userDisplayMobile = document.getElementById('user-display-mobile');
    if (userDisplay) userDisplay.textContent = name;
    if (userDisplayMobile) userDisplayMobile.textContent = name;

    const profUser = document.getElementById('prof-username');
    const profName = document.getElementById('prof-fullname');
    if (profUser) profUser.value = currentUser.username || 'admin';
    if (profName) profName.value = currentUser.full_name || 'Admin ConsultPlus';
  }
  loadLeads();
  loadCareerApplications();
  loadAgents();
  loadTestimonials();
  loadSettings();
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

// ================= 2. TABS SWITCHING & MOBILE MENU =================
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const mobileMenu = document.getElementById('admin-mobile-menu');
  const menuToggle = document.getElementById('admin-menu-toggle');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      // Update all tabs styling (both desktop and mobile)
      tabs.forEach(t => {
        if (t.getAttribute('data-tab') === targetId) {
          t.classList.add('tab-active');
          t.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
        } else {
          t.classList.remove('tab-active');
          t.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
        }
      });

      // Switch tab contents
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.remove('hidden');

      // Close mobile menu if open
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
}

// ================= 3. LEADS CRM =================
function initLeadsListeners() {
  const filterStatus = document.getElementById('filter-lead-status');
  const searchInput = document.getElementById('search-lead');
  const refreshBtn = document.getElementById('btn-refresh-leads');
  const exportBtn = document.getElementById('btn-export-csv');

  if (filterStatus) filterStatus.addEventListener('change', () => loadLeads());
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => loadLeads(), 300);
    });
  }
  if (refreshBtn) refreshBtn.addEventListener('click', () => loadLeads());
  if (exportBtn) exportBtn.addEventListener('click', () => exportLeadsCSV());
}

async function loadLeads() {
  const status = document.getElementById('filter-lead-status')?.value || 'ALL';
  const search = document.getElementById('search-lead')?.value || '';
  const tbody = document.getElementById('leads-table-body');

  try {
    const res = await fetch(`${API_BASE}/admin/leads?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`, {
      headers: getAuthHeaders()
    });
    if (res.status === 401) return showLogin();
    const data = await res.json();
    currentLeads = data.leads || [];

    // Update stats
    if (data.stats) {
      document.getElementById('stat-total-leads').textContent = data.stats.total || 0;
      document.getElementById('stat-baru-leads').textContent = data.stats.baru || 0;
      document.getElementById('stat-semakan-leads').textContent = data.stats.semakan || 0;
      const leadsBadge = document.getElementById('badge-leads-count');
      const leadsBadgeMobile = document.getElementById('badge-leads-count-mobile');
      if (leadsBadge) leadsBadge.textContent = data.stats.total || 0;
      if (leadsBadgeMobile) leadsBadgeMobile.textContent = data.stats.total || 0;
    }

    renderLeadsTable(currentLeads);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-rose-500 font-medium">Gagal memuatkan data leads.</td></tr>`;
  }
}

function renderLeadsTable(leads) {
  const tbody = document.getElementById('leads-table-body');
  const cardsContainer = document.getElementById('leads-cards-container');

  if (!leads || leads.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-medium">Tiada permohonan dijumpai.</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div class="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs">Tiada permohonan dijumpai.</div>`;
    return;
  }

  // 1. Render Desktop Table
  if (tbody) {
    tbody.innerHTML = leads.map(l => {
      const cleanPhone = (l.phone || '').replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanPhone.startsWith('60') ? cleanPhone : '60' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Salam ${l.applicant_name}, saya perunding pinjaman dari ConsultPlus mengenai permohonan semakan kelayakan anda.`)}`;
      
      let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (l.status === 'BARU') statusClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      if (l.status === 'DALAM SEMAKAN') statusClass = 'bg-blue-50 text-blue-800 border-blue-300';
      if (l.status === 'LULUS') statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      if (l.status === 'DITOLAK') statusClass = 'bg-rose-50 text-rose-800 border-rose-300';

      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
            <span class="font-bold text-slate-900 block">#${l.id}</span>
            <span class="text-slate-500 text-[10px]">${(l.created_at || '').substring(0, 16)}</span>
            <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-600 font-medium">${l.location_state || 'Selangor'}</span>
          </td>
          <td class="py-3.5 px-4">
            <span class="font-bold text-slate-900 block">${l.applicant_name}</span>
            <span class="text-[10px] text-slate-500 block">IC: ${l.ic_number || '-'}</span>
            <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 mt-0.5">
              ${WHATSAPP_SVG}
              <span>${l.phone}</span>
            </a>
          </td>
          <td class="py-3.5 px-4">
            <span class="text-slate-900 font-semibold block">${l.sector || '-'}</span>
            <span class="text-[10px] text-slate-500 block">Majikan: ${l.employer_name || '-'}</span>
            <span class="text-[10px] text-slate-600 font-medium">Gaji: ${l.salary || '-'}</span>
          </td>
          <td class="py-3.5 px-4">
            <span class="text-slate-800 font-medium block">${l.credit_issues || 'Tiada Masalah'}</span>
            <span class="text-[10px] text-slate-500">Sijil: ${l.professional_cert || 'TIADA'}</span>
          </td>
          <td class="py-3.5 px-4 whitespace-nowrap">
            <select onchange="updateLeadStatus(${l.id}, this.value)" class="text-[11px] font-semibold rounded-lg px-2.5 py-1 border ${statusClass} focus:outline-none cursor-pointer">
              <option value="BARU" ${l.status === 'BARU' ? 'selected' : ''}>BARU</option>
              <option value="DALAM SEMAKAN" ${l.status === 'DALAM SEMAKAN' ? 'selected' : ''}>DALAM SEMAKAN</option>
              <option value="HANTAR KE BANK" ${l.status === 'HANTAR KE BANK' ? 'selected' : ''}>HANTAR KE BANK</option>
              <option value="LULUS" ${l.status === 'LULUS' ? 'selected' : ''}>LULUS</option>
              <option value="DITOLAK" ${l.status === 'DITOLAK' ? 'selected' : ''}>DITOLAK</option>
            </select>
          </td>
          <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
            <button onclick="viewLeadDetails(${l.id})" class="px-2.5 py-1 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold transition">
              Butiran
            </button>
            <button onclick="deleteLead(${l.id})" class="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition" title="Padam">
              ✕
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Render Mobile Cards View
  if (cardsContainer) {
    cardsContainer.innerHTML = leads.map(l => {
      const cleanPhone = (l.phone || '').replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanPhone.startsWith('60') ? cleanPhone : '60' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Salam ${l.applicant_name}, saya perunding pinjaman dari ConsultPlus mengenai permohonan semakan kelayakan anda.`)}`;
      
      let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (l.status === 'BARU') statusClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      if (l.status === 'DALAM SEMAKAN') statusClass = 'bg-blue-50 text-blue-800 border-blue-300';
      if (l.status === 'LULUS') statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      if (l.status === 'DITOLAK') statusClass = 'bg-rose-50 text-rose-800 border-rose-300';

      return `
        <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-slate-900 text-xs">#${l.id}</span>
              <span class="text-[10px] text-slate-400 font-medium">${(l.created_at || '').substring(0, 16)}</span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">${l.location_state || 'Selangor'}</span>
            </div>
            <div>
              <select onchange="updateLeadStatus(${l.id}, this.value)" class="text-[11px] font-bold rounded-lg px-2 py-1 border ${statusClass} focus:outline-none cursor-pointer">
                <option value="BARU" ${l.status === 'BARU' ? 'selected' : ''}>BARU</option>
                <option value="DALAM SEMAKAN" ${l.status === 'DALAM SEMAKAN' ? 'selected' : ''}>DALAM SEMAKAN</option>
                <option value="HANTAR KE BANK" ${l.status === 'HANTAR KE BANK' ? 'selected' : ''}>HANTAR KE BANK</option>
                <option value="LULUS" ${l.status === 'LULUS' ? 'selected' : ''}>LULUS</option>
                <option value="DITOLAK" ${l.status === 'DITOLAK' ? 'selected' : ''}>DITOLAK</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <span class="font-extrabold text-slate-900 text-sm block">${l.applicant_name}</span>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span class="text-[11px] text-slate-500 font-mono">IC: ${l.ic_number || '-'}</span>
              <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 font-mono text-[11px]">
                ${WHATSAPP_SVG}
                <span>${l.phone}</span>
              </a>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block font-bold uppercase">Sektor & Gaji</span>
              <span class="font-semibold text-slate-800 text-[11px] block">${l.sector || '-'}</span>
              <span class="text-[10px] text-slate-500 block truncate">${l.salary || '-'}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block font-bold uppercase">Isu Kredit / Tujuan</span>
              <span class="font-semibold text-slate-800 text-[11px] block">${l.credit_issues || 'Tiada Masalah'}</span>
              <span class="text-[10px] text-slate-500 block truncate">${l.loan_purpose || '-'}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <a href="${waUrl}" target="_blank" class="flex-1 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm">
              <span>WhatsApp</span>
            </a>
            <button onclick="viewLeadDetails(${l.id})" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition">
              Butiran
            </button>
            <button onclick="deleteLead(${l.id})" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition text-xs font-bold" title="Padam Lead">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.viewLeadDetails = function(id) {
  const l = currentLeads.find(x => x.id === id);
  if (!l) return;

  document.getElementById('lead-modal-id').textContent = `Permohonan #${l.id} | Diterima: ${l.created_at || '-'}`;
  const cleanPhone = (l.phone || '').replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('60') ? cleanPhone : '60' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Salam ${l.applicant_name}, saya perunding pinjaman dari ConsultPlus mengenai permohonan semakan kelayakan anda.`)}`;
  document.getElementById('lead-modal-wa-btn').setAttribute('href', waUrl);

  const container = document.getElementById('lead-details-content');
  container.innerHTML = `
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">1. Nama Penuh:</span>
      <span class="text-slate-900 font-bold text-sm">${l.applicant_name || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">2. Nombor Kad Pengenalan (IC):</span>
      <span class="text-slate-900 font-bold font-mono text-sm">${l.ic_number || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">3. Nombor Telefon WhatsApp:</span>
      <span class="text-emerald-700 font-bold text-sm">${l.phone || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">4. Lokasi / Negeri:</span>
      <span class="text-slate-900 font-bold text-sm">${l.location_state || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">5. Sektor Pekerjaan:</span>
      <span class="text-slate-900 font-bold text-sm">${l.sector || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">6. Majikan / Syarikat / Jabatan:</span>
      <span class="text-slate-900 font-bold text-sm">${l.employer_name || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">7. Status Jawatan:</span>
      <span class="text-slate-900 font-bold text-sm">${l.employment_status || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">8. Gaji Kasar Bulanan:</span>
      <span class="text-slate-900 font-bold text-sm text-emerald-800">${l.salary || '-'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">9. Sijil Profesional:</span>
      <span class="text-slate-900 font-bold text-sm">${l.professional_cert || 'TIADA'}</span>
    </div>
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <span class="text-slate-500 font-semibold block">11. Saluran Media Sosial:</span>
      <span class="text-slate-900 font-bold text-sm">${l.social_channel || 'Website'}</span>
    </div>
    <div class="sm:col-span-2 p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
      <span class="text-amber-800 font-bold block">10. Masalah Kredit / Kewangan Dihadapi:</span>
      <span class="text-slate-900 font-medium block leading-relaxed">${l.credit_issues || 'Tiada Masalah'}</span>
    </div>
  `;

  document.getElementById('modal-lead-details').classList.remove('hidden');
};

window.closeLeadModal = function() {
  document.getElementById('modal-lead-details').classList.add('hidden');
};

window.updateLeadStatus = async function(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/admin/leads`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status: newStatus })
    });
    if (res.ok) {
      loadLeads();
    }
  } catch (err) {
    alert('Gagal mengemaskini status lead.');
  }
};

window.deleteLead = async function(id) {
  if (!confirm(`Adakah anda pasti ingin memadamkan rekod pemohon #${id}?`)) return;
  try {
    const res = await fetch(`${API_BASE}/admin/leads?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      loadLeads();
    }
  } catch (err) {
    alert('Gagal memadam lead.');
  }
};

function exportLeadsCSV() {
  if (!currentLeads || currentLeads.length === 0) {
    alert('Tiada data permohonan untuk diexport.');
    return;
  }

  const headers = ['ID', 'Tarikh', 'Nama Pemohon', 'No IC', 'No Telefon', 'Negeri', 'Sektor Pekerjaan', 'Nama Majikan', 'Status Jawatan', 'Gaji Kasar', 'Sijil Profesional', 'Masalah Kredit', 'Saluran Sosmed', 'Status Kes'];
  const rows = currentLeads.map(l => [
    l.id,
    `"${l.created_at || ''}"`,
    `"${(l.applicant_name || '').replace(/"/g, '""')}"`,
    `"${l.ic_number || ''}"`,
    `"${l.phone || ''}"`,
    `"${l.location_state || ''}"`,
    `"${l.sector || ''}"`,
    `"${(l.employer_name || '').replace(/"/g, '""')}"`,
    `"${l.employment_status || ''}"`,
    `"${l.salary || ''}"`,
    `"${l.professional_cert || ''}"`,
    `"${(l.credit_issues || '').replace(/"/g, '""')}"`,
    `"${l.social_channel || ''}"`,
    `"${l.status || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ConsultPlus_Leads_Full_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ================= 4. LEADERSHIP TEAM / HERO CARDS MANAGEMENT =================
const DEFAULT_TEAM_DATA = [
  { id: 1, name: "Tn. Zaim Rosli", title: "CEO & Pengasas", role: "Ketua Eksekutif", badge_label: "CEO & Pengasas", image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-yellow", display_order: 1, status: "AKTIF" },
  { id: 2, name: "Pn. Faridah", title: "Pengurus Risiko", role: "Credit Manager", badge_label: "Pengurus Risiko", image_url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navy", display_order: 2, status: "AKTIF" },
  { id: 3, name: "Pn. Sarah", title: "Pengarah Urusan", role: "Managing Director", badge_label: "Pengarah Urusan", image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navyDeep", display_order: 3, status: "AKTIF" },
  { id: 4, name: "En. Amirul", title: "Ketua SME", role: "SME Financing Lead", badge_label: "Ketua SME", image_url: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-blueAccent", display_order: 4, status: "AKTIF" },
  { id: 5, name: "En. Razif", title: "Hubungan Bank", role: "Banking Relations Lead", badge_label: "Hubungan Bank", image_url: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-navy", display_order: 5, status: "AKTIF" },
  { id: 6, name: "Cik Aina", title: "Pakar Refinance", role: "Mortgage Lead", badge_label: "Pakar Refinance", image_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80", card_color: "bg-brand-yellow", display_order: 6, status: "AKTIF" }
];

function renderAgentsGrid() {
  const container = document.getElementById('agents-grid');
  if (!container) return;

  if (currentAgents.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center py-10 text-slate-400 font-medium">Tiada ahli kepimpinan didaftarkan.</div>`;
    return;
  }

  container.innerHTML = currentAgents.map(a => {
    const isAktif = a.status === 'AKTIF';
    const img = a.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80';
    return `
      <div class="p-4 rounded-3xl bg-white border ${isAktif ? 'border-slate-200 shadow-sm' : 'border-rose-200 bg-rose-50/20'} space-y-3">
        <div class="flex items-center gap-3">
          <div class="relative w-16 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm">
            <img src="${img}" alt="${a.name}" class="w-full h-full object-cover" />
            <div class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white text-center py-0.5 font-bold truncate px-1">
              Pos #${a.display_order || 1}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[9px] rounded-full inline-block mb-1">
              ${a.badge_label || a.title || 'Eksekutif'}
            </span>
            <h4 class="font-bold text-slate-900 text-sm truncate">${a.name}</h4>
            <p class="text-[11px] text-[#0D276B] font-semibold truncate uppercase tracking-wider">${a.role}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-medium">Tema: ${a.card_color || 'Default'}</span>
          <div class="flex items-center gap-1.5">
            <button onclick="editAgentModal(${a.id})" class="px-3 py-1.5 bg-[#0D276B] hover:bg-[#081B4B] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm">
              <span>Edit Gambar & Info</span>
            </button>
            <button onclick="deleteAgent(${a.id})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition" title="Padam">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadAgents() {
  try {
    const savedLocal = localStorage.getItem('cp_custom_team');
    if (savedLocal) {
      currentAgents = JSON.parse(savedLocal);
    } else {
      currentAgents = [...DEFAULT_TEAM_DATA];
    }
  } catch (e) {
    currentAgents = [...DEFAULT_TEAM_DATA];
  }
  renderAgentsGrid();

  try {
    const res = await fetch(`${API_BASE}/admin/team`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (data && data.team && data.team.length > 0) {
      currentAgents = data.team;
      localStorage.setItem('cp_custom_team', JSON.stringify(currentAgents));
      renderAgentsGrid();
    }
  } catch (err) {
    console.error(err);
  }
}

// Modal open/close for Agent / Leadership Member
document.getElementById('btn-add-agent-modal')?.addEventListener('click', () => {
  document.getElementById('form-agent').reset();
  document.getElementById('agent-id').value = '';
  document.getElementById('agent-image-url').value = '';
  const previewImg = document.getElementById('agent-image-preview');
  const placeholder = document.getElementById('agent-image-placeholder');
  if (previewImg) previewImg.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
  document.getElementById('modal-agent-title').textContent = 'Tambah Ahli Kepimpinan';
  document.getElementById('modal-agent').classList.remove('hidden');
});

window.closeAgentModal = function() {
  document.getElementById('modal-agent').classList.add('hidden');
};

window.editAgentModal = function(id) {
  const a = currentAgents.find(x => x.id === id);
  if (!a) return;
  document.getElementById('agent-id').value = a.id;
  document.getElementById('agent-name').value = a.name;
  document.getElementById('agent-badge-label').value = a.badge_label || a.title || '';
  document.getElementById('agent-role').value = a.role;
  document.getElementById('agent-display-order').value = a.display_order || 1;
  document.getElementById('agent-phone').value = a.phone || '';
  document.getElementById('agent-card-color').value = a.card_color || 'bg-brand-yellow';
  
  const imgUrl = a.image_url || '';
  document.getElementById('agent-image-url').value = imgUrl;
  
  const previewImg = document.getElementById('agent-image-preview');
  const placeholder = document.getElementById('agent-image-placeholder');
  if (imgUrl && previewImg) {
    previewImg.src = imgUrl;
    previewImg.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
  } else {
    if (previewImg) previewImg.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
  }

  document.getElementById('modal-agent-title').textContent = `Kemaskini ${a.name}`;
  document.getElementById('modal-agent').classList.remove('hidden');
};

document.getElementById('form-agent')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idStr = document.getElementById('agent-id').value;
  const id = idStr ? parseInt(idStr) : Date.now();
  const name = document.getElementById('agent-name').value.trim();
  const badge_label = document.getElementById('agent-badge-label').value.trim();
  const role = document.getElementById('agent-role').value.trim();
  const display_order = parseInt(document.getElementById('agent-display-order').value) || 1;
  const phone = document.getElementById('agent-phone').value.trim() || '601171191170';
  const card_color = document.getElementById('agent-card-color').value;
  const image_url = document.getElementById('agent-image-url').value.trim();

  const payload = {
    id,
    name,
    badge_label,
    title: badge_label,
    role,
    display_order,
    phone,
    card_color,
    image_url,
    status: 'AKTIF'
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Simpan & Kemaskini Laman Web';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sedang memuat naik & menyimpan...</span>';
  }

  try {
    const res = await fetch(`${API_BASE}/admin/team`, {
      method: idStr ? 'PUT' : 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (data && data.team && Array.isArray(data.team)) {
      currentAgents = data.team;
    } else {
      const existingIdx = currentAgents.findIndex(x => x.id === id);
      if (existingIdx >= 0) {
        currentAgents[existingIdx] = { ...currentAgents[existingIdx], ...payload };
      } else {
        currentAgents.push(payload);
      }
      currentAgents.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }

    localStorage.setItem('cp_custom_team', JSON.stringify(currentAgents));
    renderAgentsGrid();
    closeAgentModal();
    alert(`Berjaya! Gambar dan maklumat ${name} telah disimpan dan diselaraskan secara langsung ke laman web.`);
  } catch (err) {
    console.error('API sync error:', err);
    // Fallback locally
    const existingIdx = currentAgents.findIndex(x => x.id === id);
    if (existingIdx >= 0) {
      currentAgents[existingIdx] = { ...currentAgents[existingIdx], ...payload };
    } else {
      currentAgents.push(payload);
    }
    localStorage.setItem('cp_custom_team', JSON.stringify(currentAgents));
    renderAgentsGrid();
    closeAgentModal();
    alert(`Berjaya disimpan!`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
});

window.deleteAgent = async function(id) {
  if (!confirm('Adakah anda pasti ingin memadamkan ahli kepimpinan ini?')) return;
  currentAgents = currentAgents.filter(x => x.id !== id);
  localStorage.setItem('cp_custom_team', JSON.stringify(currentAgents));
  renderAgentsGrid();

  try {
    await fetch(`${API_BASE}/admin/team?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {}
};

// Image input handler
function setupImageFileInput() {
  const fileInput = document.getElementById('agent-image-file');
  const urlInput = document.getElementById('agent-image-url');
  const previewImg = document.getElementById('agent-image-preview');
  const placeholder = document.getElementById('agent-image-placeholder');

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) {
        if (previewImg) {
          previewImg.src = urlInput.value.trim();
          previewImg.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (urlInput) urlInput.value = compressedDataUrl;
          if (previewImg) {
            previewImg.src = compressedDataUrl;
            previewImg.classList.remove('hidden');
          }
          if (placeholder) placeholder.classList.add('hidden');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

// ================= 5. TESTIMONIALS MANAGEMENT =================
async function loadTestimonials() {
  const container = document.getElementById('testimonials-grid');
  try {
    const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: getAuthHeaders() });
    const data = await res.json();
    currentTestimonials = data.testimonials || [];

    if (currentTestimonials.length === 0) {
      container.innerHTML = `<div class="col-span-2 text-center py-10 text-slate-400 font-medium">Tiada testimoni didaftarkan.</div>`;
      return;
    }

    container.innerHTML = currentTestimonials.map(t => `
      <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="font-bold text-slate-900 text-xs block truncate">${t.client_name}</span>
            <span class="text-[11px] text-emerald-700 font-semibold block truncate">${t.profession}</span>
          </div>
          <span class="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
            Lulus: ${t.loan_approved}
          </span>
        </div>
        <p class="text-xs text-slate-600 italic">"${t.story || t.original_issue}"</p>
        <div class="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Jimat: <strong class="text-emerald-700">${t.monthly_savings || '-'}</strong></span>
          <div class="flex items-center gap-1.5">
            <button onclick="editTestimonialModal(${t.id})" class="px-2.5 py-1 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold transition">
              Edit
            </button>
            <button onclick="deleteTestimonial(${t.id})" class="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition">
              Padam
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// Modal open/close for Testimonial
document.getElementById('btn-add-testimonial-modal')?.addEventListener('click', () => {
  document.getElementById('form-testimonial').reset();
  document.getElementById('testimonial-id').value = '';
  document.getElementById('modal-testimonial-title').textContent = 'Tambah Testimoni Baharu';
  document.getElementById('modal-testimonial').classList.remove('hidden');
});

window.closeTestimonialModal = function() {
  document.getElementById('modal-testimonial').classList.add('hidden');
};

window.editTestimonialModal = function(id) {
  const t = currentTestimonials.find(x => x.id === id);
  if (!t) return;
  document.getElementById('testimonial-id').value = t.id;
  document.getElementById('testi-name').value = t.client_name || '';
  document.getElementById('testi-profession').value = t.profession || '';
  document.getElementById('testi-loan-approved').value = t.loan_approved || '';
  document.getElementById('testi-savings').value = t.monthly_savings || '';
  document.getElementById('testi-issue').value = t.original_issue || '';
  document.getElementById('testi-story').value = t.story || '';
  document.getElementById('modal-testimonial-title').textContent = 'Kemaskini Testimoni Klien';
  document.getElementById('modal-testimonial').classList.remove('hidden');
};

document.getElementById('form-testimonial')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('testimonial-id').value;
  const payload = {
    client_name: document.getElementById('testi-name').value.trim(),
    profession: document.getElementById('testi-profession').value.trim(),
    loan_approved: document.getElementById('testi-loan-approved').value.trim(),
    monthly_savings: document.getElementById('testi-savings').value.trim(),
    original_issue: document.getElementById('testi-issue').value.trim(),
    story: document.getElementById('testi-story').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/admin/testimonials`, {
      method: id ? 'PUT' : 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(id ? { id: parseInt(id), ...payload } : payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      closeTestimonialModal();
      loadTestimonials();
    } else {
      alert(data.error || 'Gagal menyimpan testimoni.');
    }
  } catch (err) {
    alert('Ralat sambungan.');
  }
});

window.deleteTestimonial = async function(id) {
  if (!confirm('Padamkan testimoni ini?')) return;
  try {
    const res = await fetch(`${API_BASE}/admin/testimonials?id=${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) loadTestimonials();
  } catch (err) {}
};

// ================= 6. SITE SETTINGS =================
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() });
    const data = await res.json();
    const settings = {};
    (data.settings || []).forEach(s => settings[s.key] = s.value);

    if (settings.whatsapp_number) document.getElementById('set-whatsapp').value = settings.whatsapp_number;
    if (settings.phone_display) document.getElementById('set-phone-display').value = settings.phone_display;
    if (settings.email) document.getElementById('set-email').value = settings.email;
    if (settings.address) document.getElementById('set-address').value = settings.address;
    if (settings.office_hours) document.getElementById('set-hours').value = settings.office_hours;
    if (settings.min_interest_rate) document.getElementById('set-rate').value = settings.min_interest_rate;
    if (settings.max_loan_amount) document.getElementById('set-max-loan').value = settings.max_loan_amount;
    if (settings.announcement_text) document.getElementById('set-announcement').value = settings.announcement_text;
  } catch (err) {
    console.error(err);
  }
}

function initSettingsListeners() {
  const form = document.getElementById('settings-form');
  const alertBox = document.getElementById('settings-alert');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        whatsapp_number: document.getElementById('set-whatsapp').value.trim(),
        phone_display: document.getElementById('set-phone-display').value.trim(),
        email: document.getElementById('set-email').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        office_hours: document.getElementById('set-hours').value.trim(),
        min_interest_rate: document.getElementById('set-rate').value.trim(),
        max_loan_amount: document.getElementById('set-max-loan').value.trim(),
        announcement_text: document.getElementById('set-announcement').value.trim()
      };

      try {
        const res = await fetch(`${API_BASE}/admin/settings`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        alertBox.textContent = data.message || 'Tetapan berjaya disimpan.';
        alertBox.className = 'p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 4000);
      } catch (err) {
        alertBox.textContent = 'Ralat menyimpan tetapan.';
        alertBox.className = 'p-3.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
        alertBox.classList.remove('hidden');
      }
    });
  }

  // Profile / Password Change Listener
  const profileForm = document.getElementById('profile-form');
  const profileAlert = document.getElementById('profile-alert');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('prof-username').value.trim();
      const full_name = document.getElementById('prof-fullname').value.trim();
      const current_password = document.getElementById('prof-current-password').value;
      const new_password = document.getElementById('prof-new-password').value;
      const btn = document.getElementById('btn-save-profile');

      btn.disabled = true;
      btn.innerHTML = '<span>Sedang mengemaskini...</span>';
      profileAlert.classList.add('hidden');

      try {
        const res = await fetch(`${API_BASE}/admin/profile`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ username, full_name, current_password, new_password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          profileAlert.textContent = data.message || 'Profil berjaya dikemaskini.';
          profileAlert.className = 'p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
          profileAlert.classList.remove('hidden');

          if (data.user) {
            currentUser = { ...currentUser, ...data.user };
            localStorage.setItem('cp_admin_user', JSON.stringify(currentUser));
            const name = currentUser.full_name || currentUser.username;
            const userDisplay = document.getElementById('user-display');
            const userDisplayMobile = document.getElementById('user-display-mobile');
            if (userDisplay) userDisplay.textContent = name;
            if (userDisplayMobile) userDisplayMobile.textContent = name;
          }

          document.getElementById('prof-current-password').value = '';
          document.getElementById('prof-new-password').value = '';
          setTimeout(() => profileAlert.classList.add('hidden'), 4000);
        } else {
          profileAlert.textContent = data.error || 'Gagal mengemaskini profil.';
          profileAlert.className = 'p-3.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
          profileAlert.classList.remove('hidden');
        }
      } catch (err) {
        profileAlert.textContent = 'Ralat sambungan ke pelayan.';
        profileAlert.className = 'p-3.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
        profileAlert.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Kemaskini Akaun & Kata Laluan</span>';
      }
    });
  }
}

// ================= 7. CAREER APPLICATIONS (ONBOARDING KONSULTAN) =================
async function loadCareerApplications() {
  const status = document.getElementById('filter-career-status')?.value || 'ALL';
  const search = document.getElementById('search-career')?.value.trim() || '';

  try {
    let url = `${API_BASE}/admin/career-applications?status=${encodeURIComponent(status)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();

    currentCareer = data.applications || [];
    renderCareerApplications(currentCareer);

    // Update stats
    if (data.stats) {
      const s = data.stats;
      const totalEl = document.getElementById('stat-total-career');
      const baruEl = document.getElementById('stat-baru-career');
      const temudugaEl = document.getElementById('stat-temuduga-career');
      const lulusEl = document.getElementById('stat-lulus-career');
      const badgeEl = document.getElementById('badge-career-count');

      if (totalEl) totalEl.textContent = s.total || 0;
      if (baruEl) baruEl.textContent = s.baru || 0;
      if (temudugaEl) temudugaEl.textContent = s.temuduga || 0;
      const badgeMobileEl = document.getElementById('badge-career-count-mobile');
      if (badgeEl) badgeEl.textContent = s.baru || 0;
      if (badgeMobileEl) badgeMobileEl.textContent = s.baru || 0;
    }
  } catch (err) {
    console.error('Error loading career applications:', err);
  }
}

function renderCareerApplications(apps) {
  const tbody = document.getElementById('career-table-body');
  const cardsContainer = document.getElementById('career-cards-container');

  if (!apps || apps.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tiada rekod permohonan kerjaya dijumpai.</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div class="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs">Tiada rekod permohonan kerjaya dijumpai.</div>`;
    return;
  }

  const getStatusBadge = (st) => {
    switch (st) {
      case 'BARU':
        return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">BARU</span>';
      case 'TEMUDUGA':
        return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">TEMUDUGA</span>';
      case 'LULUS':
        return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">LULUS</span>';
      case 'DITOLAK':
        return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">DITOLAK</span>';
      default:
        return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">${st || 'BARU'}</span>`;
    }
  };

  // 1. Render Desktop Table
  if (tbody) {
    tbody.innerHTML = apps.map(app => `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="py-3 px-4">
          <span class="font-bold text-slate-900 block font-mono text-[11px]">${app.ref_no || `CP-REC-${app.id}`}</span>
          <span class="text-[10px] text-slate-400 block">${(app.created_at || '').substring(0, 10)}</span>
        </td>
        <td class="py-3 px-4">
          <span class="font-bold text-slate-900 block">${app.full_name}</span>
          <span class="text-[10px] text-slate-500 font-mono block">IC: ${app.ic_number}</span>
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-1.5 font-bold text-emerald-700 font-mono">
            <a href="https://wa.me/${app.phone}" target="_blank" class="hover:underline flex items-center gap-1">
              ${WHATSAPP_SVG}
              <span>${app.phone}</span>
            </a>
          </div>
          <span class="text-[10px] text-slate-500 block truncate max-w-[140px]">${app.email || '-'}</span>
        </td>
        <td class="py-3 px-4">
          <span class="font-semibold text-slate-800 block">${app.address_city || '-'}, ${app.address_state || '-'}</span>
          <span class="text-[10px] text-slate-500 block">Perekrut: ${app.recruiter_name || 'HQ ConsultPlus'}</span>
        </td>
        <td class="py-3 px-4">
          <span class="font-bold text-slate-800 block text-[11px]">${app.bank_name || '-'}</span>
          <span class="text-[10px] text-slate-500 font-mono block">${app.bank_account_number || '-'}</span>
        </td>
        <td class="py-3 px-4">
          ${getStatusBadge(app.status)}
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
          <button onclick="openCareerModal(${app.id})" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[11px] border border-emerald-200 transition">
            Lihat KYC
          </button>
          <button onclick="deleteCareerApplication(${app.id})" class="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-[11px] border border-rose-200 transition" title="Padam Permohonan">
            ✕
          </button>
        </td>
      </tr>
    `).join('');
  }

  // 2. Render Mobile Cards View
  if (cardsContainer) {
    cardsContainer.innerHTML = apps.map(app => `
      <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <span class="font-mono font-bold text-slate-900 text-xs block">${app.ref_no || `CP-REC-${app.id}`}</span>
            <span class="text-[10px] text-slate-400 font-medium">${(app.created_at || '').substring(0, 10)}</span>
          </div>
          <div>
            ${getStatusBadge(app.status)}
          </div>
        </div>

        <div class="space-y-1">
          <span class="font-extrabold text-slate-900 text-sm block">${app.full_name}</span>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span class="text-[11px] text-slate-500 font-mono">IC: ${app.ic_number}</span>
            <a href="https://wa.me/${app.phone}" target="_blank" class="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 font-mono text-[11px]">
              ${WHATSAPP_SVG}
              <span>${app.phone}</span>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Lokasi / Penaja</span>
            <span class="font-semibold text-slate-800 text-[11px] block truncate">${app.address_city || '-'}, ${app.address_state || '-'}</span>
            <span class="text-[10px] text-slate-500 block truncate">Perekrut: ${app.recruiter_name || 'HQ'}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Akaun Bank</span>
            <span class="font-semibold text-slate-800 text-[11px] block truncate">${app.bank_name || '-'}</span>
            <span class="text-[10px] text-slate-500 font-mono block truncate">${app.bank_account_number || '-'}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button onclick="openCareerModal(${app.id})" class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5">
            <span>Lihat KYC & Dokumen</span>
          </button>
          <a href="https://wa.me/${app.phone}" target="_blank" class="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition" title="WhatsApp">
            ${WHATSAPP_SVG}
          </a>
          <button onclick="deleteCareerApplication(${app.id})" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition text-xs font-bold" title="Padam">
            ✕
          </button>
        </div>
      </div>
    `).join('');
  }
}

let activeCareerAppId = null;

window.openCareerModal = function(id) {
  const app = currentCareer.find(a => a.id === id);
  if (!app) return;

  activeCareerAppId = id;
  const modal = document.getElementById('modal-career-detail');
  const refEl = document.getElementById('career-modal-ref');
  const contentEl = document.getElementById('career-details-content');
  const docsEl = document.getElementById('career-docs-preview');
  const statusSelect = document.getElementById('modal-career-status-select');
  const notesInput = document.getElementById('modal-career-notes-input');
  const waBtn = document.getElementById('career-modal-wa-btn');

  if (refEl) refEl.innerText = `${app.ref_no || `CP-REC-${app.id}`} • Diterima: ${app.created_at || '-'}`;
  if (statusSelect) statusSelect.value = app.status || 'BARU';
  if (notesInput) notesInput.value = app.notes || '';

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">Nama Penuh (MyKad)</span>
        <span class="font-extrabold text-slate-900 text-sm">${app.full_name}</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">No. Kad Pengenalan / IC</span>
        <span class="font-mono font-bold text-slate-900 text-sm">${app.ic_number}</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">Tarikh Lahir & Status</span>
        <span class="font-semibold text-slate-900">${app.date_of_birth || '-'} • ${app.marital_status || 'Bujang'} (${app.race || 'Melayu'}, ${app.religion || 'Islam'})</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">No. WhatsApp & Emel</span>
        <span class="font-mono font-bold text-emerald-700">${app.phone}</span>
        <span class="text-[11px] text-slate-600 block">${app.email || '-'}</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">Alamat Kediaman Penuh</span>
        <span class="font-medium text-slate-900 leading-relaxed">${app.address_line_1 || ''} ${app.address_line_2 || ''}, ${app.address_postcode || ''} ${app.address_city || ''}, ${app.address_state || ''}</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">Akaun Bank Komisen</span>
        <span class="font-bold text-slate-900">${app.bank_name || '-'}</span>
        <span class="font-mono text-slate-800 block">${app.bank_account_number || '-'} (${app.bank_account_name || app.full_name})</span>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
        <span class="font-bold text-slate-500 block text-[10px] uppercase">Perekrut / Penaja</span>
        <span class="font-bold text-slate-900">${app.recruiter_name || 'HQ ConsultPlus'}</span>
      </div>
    `;
  }

  if (docsEl) {
    const renderDocCard = (title, dataUri) => {
      if (!dataUri) {
        return `
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <span class="font-bold text-slate-600 block text-[11px]">${title}</span>
            <span class="text-[10px] text-slate-400">Tiada fail</span>
          </div>
        `;
      }
      const isPdf = dataUri.startsWith('data:application/pdf');
      return `
        <div class="p-3 bg-white border border-slate-200 rounded-xl text-center space-y-2 hover:border-emerald-500 transition shadow-sm">
          <span class="font-bold text-slate-800 block text-[11px]">${title}</span>
          ${isPdf ? `
            <a href="${dataUri}" download="${title}.pdf" class="inline-block px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 hover:bg-emerald-600 hover:text-white transition">
              Muat Turun PDF
            </a>
          ` : `
            <a href="${dataUri}" target="_blank" class="block group">
              <img src="${dataUri}" alt="${title}" class="h-20 w-auto mx-auto object-cover rounded-lg border border-slate-200 group-hover:opacity-90">
              <span class="text-[10px] text-emerald-700 font-semibold mt-1 block">Buka Gambar Penuh ↗</span>
            </a>
          `}
        </div>
      `;
    };

    docsEl.innerHTML = `
      ${renderDocCard('1. IC Depan', app.ic_front_data)}
      ${renderDocCard('2. IC Belakang', app.ic_back_data)}
      ${renderDocCard('3. Selfie Bersama IC', app.selfie_ic_data)}
    `;
  }

  if (waBtn) {
    const msg = `Salam ${app.full_name}, kami daripada Pengurusan HR ConsultPlus merujuk kepada permohonan kerjaya anda (No Rujukan: ${app.ref_no || `CP-REC-${app.id}`}). Kami ingin menjemput anda untuk sesi taklimat kerjaya.`;
    waBtn.href = `https://wa.me/${app.phone}?text=${encodeURIComponent(msg)}`;
  }

  if (modal) modal.classList.remove('hidden');
};

window.closeCareerModal = function() {
  const modal = document.getElementById('modal-career-detail');
  if (modal) modal.classList.add('hidden');
  activeCareerAppId = null;
};

window.deleteCareerApplication = async function(id) {
  if (!confirm('Adakah anda pasti ingin memadamkan rekod permohonan kerjaya ini?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/career-applications?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      loadCareerApplications();
    } else {
      alert('Gagal memadamkan rekod.');
    }
  } catch (err) {
    alert('Ralat sambungan: ' + err.message);
  }
};

function initCareerListeners() {
  const filterStatus = document.getElementById('filter-career-status');
  const searchInput = document.getElementById('search-career');
  const btnRefresh = document.getElementById('btn-refresh-career');
  const btnExport = document.getElementById('btn-export-career-csv');
  const btnSaveStatus = document.getElementById('btn-save-career-status');

  if (filterStatus) filterStatus.addEventListener('change', () => loadCareerApplications());
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => loadCareerApplications(), 350);
    });
  }
  if (btnRefresh) btnRefresh.addEventListener('click', () => loadCareerApplications());

  if (btnSaveStatus) {
    btnSaveStatus.addEventListener('click', async () => {
      if (!activeCareerAppId) return;
      const status = document.getElementById('modal-career-status-select')?.value || 'BARU';
      const notes = document.getElementById('modal-career-notes-input')?.value.trim() || '';

      btnSaveStatus.disabled = true;
      btnSaveStatus.innerText = 'Sedang Menyimpan...';

      try {
        const res = await fetch(`${API_BASE}/admin/career-applications`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: activeCareerAppId, status, notes })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert('Status permohonan berjaya dikemaskini.');
          closeCareerModal();
          loadCareerApplications();
        } else {
          alert(data.error || 'Gagal mengemaskini status.');
        }
      } catch (err) {
        alert('Ralat: ' + err.message);
      } finally {
        btnSaveStatus.disabled = false;
        btnSaveStatus.innerText = 'Simpan Kemaskini';
      }
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (!currentCareer.length) {
        alert('Tiada data permohonan untuk dieksport.');
        return;
      }
      const headers = ['No Rujukan', 'Nama Penuh', 'No IC', 'Telefon', 'Emel', 'Lokasi', 'Negeri', 'Perekrut', 'Bank', 'No Akaun', 'Status', 'Catatan', 'Tarikh'];
      const rows = currentCareer.map(a => [
        `"${a.ref_no || `CP-REC-${a.id}`}"`,
        `"${(a.full_name || '').replace(/"/g, '""')}"`,
        `"${a.ic_number || ''}"`,
        `"${a.phone || ''}"`,
        `"${a.email || ''}"`,
        `"${(a.address_city || '').replace(/"/g, '""')}"`,
        `"${a.address_state || ''}"`,
        `"${(a.recruiter_name || '').replace(/"/g, '""')}"`,
        `"${a.bank_name || ''}"`,
        `"${a.bank_account_number || ''}"`,
        `"${a.status || 'BARU'}"`,
        `"${(a.notes || '').replace(/"/g, '""')}"`,
        `"${a.created_at || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ConsultPlus_Permohonan_Kerjaya_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

