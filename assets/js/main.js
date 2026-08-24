/**
 * Consult Plus Financial Advisory - Main JavaScript
 * Logic for Loan Calculators, WhatsApp Automation, Mobile Drawer, Animations & Interactive UI
 */

const APP_CONFIG = {
  consultantName: "Consult Plus Malaysia",
  whatsappNumber: "601156892341", // Format antarabangsa tanpa '+'
  email: "konsultasi@consultplus.my",
  phoneDisplay: "+60 11-5689 2341",
  address: "Level 15, Menara Kembar Bank Rakyat, Jalan Travers, KL Sentral, 50470 Kuala Lumpur"
};

// Helper: Format Malaysian Ringgit (RM)
function formatRM(amount) {
  return "RM " + Number(amount).toLocaleString('en-MY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// Calculate Loan Repayment (Malaysian Flat Rate Formula)
function calculateLoan(amount, years, ratePercent) {
  const principal = parseFloat(amount) || 0;
  const tenure = parseFloat(years) || 1;
  const rate = parseFloat(ratePercent) || 3.99;

  const totalInterest = principal * (rate / 100) * tenure;
  const totalRepayment = principal + totalInterest;
  const totalMonths = tenure * 12;
  const monthlyInstallment = totalMonths > 0 ? (totalRepayment / totalMonths) : 0;

  return {
    principal,
    tenure,
    rate,
    monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalMonths
  };
}

// Send pre-filled WhatsApp message
function sendWhatsAppMessage(messageText) {
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodedText}`;
  window.open(waUrl, '_blank');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initAnimatedCounters();
  initLoanCalculators();
  initEligibilityForms();
  initAccordions();
  initFloatingWhatsApp();
  initModal();
  initAgentVerification();
});

// 1. Navbar Sticky & Mobile Menu
function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMobileMenu = document.getElementById('close-mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    });
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeMobileMenu && mobileMenu) {
    closeMobileMenu.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
}

// 2. Scroll-Triggered Animations (Safe Immediate Visibility)
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-fade-in, .animate-slide-left, .animate-slide-right');
  animatedElements.forEach(el => el.classList.add('is-visible'));
}

// 3. Loan Calculator logic
function initLoanCalculators() {
  const calcContainer = document.getElementById('loan-calculator');
  if (!calcContainer) return;

  const amountSlider = document.getElementById('calc-amount');
  const amountDisplay = document.getElementById('calc-amount-val');
  const tenureSlider = document.getElementById('calc-tenure');
  const tenureDisplay = document.getElementById('calc-tenure-val');
  const rateSelect = document.getElementById('calc-rate');

  const outMonthly = document.getElementById('out-monthly');
  const outTotalInterest = document.getElementById('out-interest');
  const outTotalPayment = document.getElementById('out-total');
  const btnApplyCalc = document.getElementById('btn-apply-calc');

  function updateCalculation() {
    const amount = parseFloat(amountSlider.value) || 30000;
    const tenure = parseFloat(tenureSlider.value) || 5;
    const rate = parseFloat(rateSelect.value) || 3.88;

    if (amountDisplay) amountDisplay.innerText = "RM " + Number(amount).toLocaleString('en-MY');
    if (tenureDisplay) tenureDisplay.innerText = tenure + " Tahun (" + (tenure * 12) + " Bulan)";

    const res = calculateLoan(amount, tenure, rate);

    if (outMonthly) outMonthly.innerText = formatRM(res.monthlyInstallment);
    if (outTotalInterest) outTotalInterest.innerText = formatRM(res.totalInterest);
    if (outTotalPayment) outTotalPayment.innerText = formatRM(res.totalRepayment);

    if (btnApplyCalc) {
      btnApplyCalc.onclick = function() {
        const text = `Salam Konsultan ${APP_CONFIG.consultantName},\n\nSaya telah membuat kiraan di laman web dan ingin memohon pembiayaan berikut:\n` +
          `- Jumlah Pinjaman: ${formatRM(res.principal)}\n` +
          `- Tempoh Bayaran: ${res.tenure} Tahun (${res.totalMonths} Bulan)\n` +
          `- Kadar Keuntungan: ${res.rate}%\n` +
          `- Anggaran Ansuran: ${formatRM(res.monthlyInstallment)} /bulan\n\n` +
          `Mohon pihak tuan bantu semak kelayakan slip gaji saya secara percuma. Terima kasih.`;
        sendWhatsAppMessage(text);
      };
    }
  }

  if (amountSlider) amountSlider.addEventListener('input', updateCalculation);
  if (tenureSlider) tenureSlider.addEventListener('input', updateCalculation);
  if (rateSelect) rateSelect.addEventListener('change', updateCalculation);

  updateCalculation();
}

// 4. Eligibility Forms (Semakan Kelayakan & Overlap)
function initEligibilityForms() {
  const forms = document.querySelectorAll('.eligibility-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('fullName') || 'Pelanggan';
      const phone = formData.get('phone') || '';
      const sector = formData.get('sector') || 'Kakitangan Kerajaan';
      const basicSalary = formData.get('salary') || '0';
      const loanAmount = formData.get('loanAmount') || '50,000';
      const ccrisStatus = formData.get('creditStatus') || 'Tiada Masalah CCRIS/CTOS';
      const notes = formData.get('notes') || '-';
      const formType = form.getAttribute('data-form-type') || 'Semakan Kelayakan Pinjaman';

      const msg = `BORANG PERMOHONAN: ${formType.toUpperCase()}\n` +
        `-----------------------------------------\n` +
        `Nama: ${name}\n` +
        `No. Telefon: ${phone}\n` +
        `Sektor: ${sector}\n` +
        `Gaji Pokok & Elaun: RM ${Number(basicSalary).toLocaleString('en-MY')}\n` +
        `Jumlah Diperlukan: RM ${Number(loanAmount).toLocaleString('en-MY')}\n` +
        `Status CCRIS/CTOS: ${ccrisStatus}\n` +
        `Catatan / Tujuan: ${notes}\n` +
        `-----------------------------------------\n` +
        `Salam Konsultan ${APP_CONFIG.consultantName}, mohon semak kelayakan dan cadangkan pakej terbaik.`;

      sendWhatsAppMessage(msg);
    });
  });
}

// 5. Accordion Toggle
function initAccordions() {
  const accordionButtons = document.querySelectorAll('.accordion-btn');
  accordionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.accordion-icon');
      
      const isOpen = content.classList.contains('active');
      
      // Close all in this group
      const parent = btn.closest('.accordion-group');
      if (parent) {
        parent.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
      }
      
      if (!isOpen) {
        content.classList.add('active');
      }
    });
  });
}

// 6. Floating WhatsApp Button
function initFloatingWhatsApp() {
  const waBtn = document.getElementById('floating-wa-btn');
  if (waBtn) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = `Salam Konsultan ${APP_CONFIG.consultantName}, saya ingin mendapatkan khidmat nasihat dan semakan kelayakan pinjaman percuma.`;
      sendWhatsAppMessage(text);
    });
  }
}

// 7. Quick Modal
function initModal() {
  const openButtons = document.querySelectorAll('.open-consultation-modal');
  const modal = document.getElementById('consultation-modal');
  const closeBtn = document.getElementById('close-consultation-modal');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
}

// 8. Animated Number Counters (Count up from 0 when scrolled into view)
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.counter-number');
  if (!counterElements.length) return;

  function startCounter(el) {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    const useComma = el.getAttribute('data-format') === 'comma';
    const duration = parseInt(el.getAttribute('data-duration')) || 1800; // 1.8s

    let startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic calculation for smooth slowdown at end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeOut * target;

      let formattedNumber;
      if (decimals > 0) {
        formattedNumber = currentVal.toFixed(decimals);
      } else if (useComma) {
        formattedNumber = Math.floor(currentVal).toLocaleString('en-MY');
      } else {
        formattedNumber = Math.floor(currentVal);
      }

      el.textContent = `${prefix}${formattedNumber}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        let finalFormatted;
        if (decimals > 0) {
          finalFormatted = target.toFixed(decimals);
        } else if (useComma) {
          finalFormatted = target.toLocaleString('en-MY');
        } else {
          finalFormatted = target;
        }
        el.textContent = `${prefix}${finalFormatted}${suffix}`;
      }
    }

    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });

    counterElements.forEach(el => observer.observe(el));
  } else {
    counterElements.forEach(el => startCounter(el));
  }
}

// 9. Staff / Agent Official Verification Engine
const OFFICIAL_AGENTS = [
  {
    id: "CP-1021",
    name: "Ali bin Osman",
    role: "Penasihat Pembiayaan Kanan (Senior Loan Consultant)",
    phone: "601156892341",
    phoneDisplay: "011-5689 2341",
    branch: "Ibu Pejabat (HQ Menara Bank Rakyat KL)",
    zone: "Lembah Klang & Selangor",
    status: "AKTIF & BERDAFTAR",
    joinedDate: "15 Jan 2021",
    rating: "4.9 / 5.0",
    initials: "AO",
    specialty: "Pinjaman Koperasi & Penyatuan Hutang",
    avatarBg: "bg-emerald-700"
  },
  {
    id: "CP-1045",
    name: "Siti Aminah binti Razak",
    role: "Konsultan Pinjaman Peribadi Swasta & Bank",
    phone: "601156892342",
    phoneDisplay: "011-5689 2342",
    branch: "Cawangan Wilayah Utara (Pulau Pinang)",
    zone: "Penang, Kedah & Perak",
    status: "AKTIF & BERDAFTAR",
    joinedDate: "03 Mac 2022",
    rating: "4.9 / 5.0",
    initials: "SA",
    specialty: "Pinjaman Bank Swasta & Eksekutif",
    avatarBg: "bg-teal-700"
  },
  {
    id: "CP-1088",
    name: "Farhan bin Rosli",
    role: "Pakar Penstrukturan & Penyatuan Hutang (Debt Consolidation)",
    phone: "601156892343",
    phoneDisplay: "011-5689 2343",
    branch: "Cawangan Wilayah Selatan (Johor Bahru)",
    zone: "Johor, Melaka & Negeri Sembilan",
    status: "AKTIF & BERDAFTAR",
    joinedDate: "10 Ogos 2022",
    rating: "5.0 / 5.0",
    initials: "FR",
    specialty: "Overlap Hutang & Pembersihan CCRIS",
    avatarBg: "bg-indigo-700"
  },
  {
    id: "CP-1102",
    name: "Noraini binti Kassim",
    role: "Penasihat Pembiayaan Kakitangan Kerajaan (AG/KKM/Guru)",
    phone: "601156892344",
    phoneDisplay: "011-5689 2344",
    branch: "Cawangan Wilayah Pantai Timur (Kuantan)",
    zone: "Pahang, Terengganu & Kelantan",
    status: "AKTIF & BERDAFTAR",
    joinedDate: "01 Feb 2023",
    rating: "4.8 / 5.0",
    initials: "NK",
    specialty: "Koperasi BPA Angkasa & PDRM",
    avatarBg: "bg-amber-700"
  },
  {
    id: "CP-1120",
    name: "Hafiz bin Zainal Abidin",
    role: "Pengurus Khidmat Pelanggan & Analisis Kelayakan",
    phone: "601156892345",
    phoneDisplay: "011-5689 2345",
    branch: "Ibu Pejabat (HQ Menara Bank Rakyat KL)",
    zone: "Seluruh Semenanjung Malaysia",
    status: "AKTIF & BERDAFTAR",
    joinedDate: "12 Nov 2020",
    rating: "5.0 / 5.0",
    initials: "HZ",
    specialty: "Analisis Kelayakan & Profiling Kredit",
    avatarBg: "bg-slate-800"
  }
];

function initAgentVerification() {
  const form = document.getElementById('agent-search-form');
  const input = document.getElementById('agent-search-input');
  const resultContainer = document.getElementById('verification-result');
  const directoryContainer = document.getElementById('agents-directory');

  if (!form && !directoryContainer) return;

  // Render Directory Cards if element exists
  if (directoryContainer) {
    directoryContainer.innerHTML = OFFICIAL_AGENTS.map(agent => `
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-2xl ${agent.avatarBg} text-white flex items-center justify-center text-lg font-black font-heading shadow-md shrink-0">
              ${agent.initials}
            </div>
            <div>
              <div class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${agent.status}
              </div>
              <h4 class="text-base font-bold text-slate-900 leading-tight">${agent.name}</h4>
              <div class="text-xs text-emerald-600 font-mono font-bold mt-0.5">ID: ${agent.id}</div>
            </div>
          </div>

          <div class="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div><strong>Jawatan:</strong> ${agent.role}</div>
            <div><strong>Cawangan:</strong> ${agent.branch}</div>
            <div><strong>Zon:</strong> ${agent.zone}</div>
            <div><strong>Pengkhususan:</strong> ${agent.specialty}</div>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <a href="https://wa.me/${agent.phone}?text=Salam%20${encodeURIComponent(agent.name)}%20(ID:%20${agent.id}),%20saya%20telah%20mengesahkan%20profil%20tuan%20di%20portal%20Consult Plus%20dan%20ingin%20memohon%20konsultasi." target="_blank" class="inline-flex items-center justify-center w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition gap-1.5">
            <span>WhatsApp ${agent.name.split(' ')[0]}</span>
          </a>
        </div>
      </div>
    `).join('');
  }

  // Check search query from URL parameter e.g. verify.html?id=CP-1021
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('id') || urlParams.get('q');
  if (searchParam && input) {
    input.value = searchParam;
    executeVerification(searchParam);
  }

  // Quick search buttons (e.g., CP-1021, Ali Osman)
  const quickButtons = document.querySelectorAll('.quick-verify-btn');
  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-id');
      if (input) {
        input.value = val;
        executeVerification(val);
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      executeVerification(query);
    });
  }

  function executeVerification(query) {
    if (!resultContainer) return;
    if (!query) {
      resultContainer.innerHTML = '';
      return;
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');

    const matched = OFFICIAL_AGENTS.find(agent => {
      const cleanId = agent.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanName = agent.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPhone = agent.phone.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanId.includes(cleanQuery) || cleanName.includes(cleanQuery) || cleanPhone.includes(cleanQuery);
    });

      resultContainer.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#008CAC] shadow-2xl animate-fade-up">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            <!-- Avatar / Photo -->
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#012831] text-[#FFE600] flex items-center justify-center text-3xl font-black font-heading shadow-xl shrink-0">
              ${matched.initials}
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center md:text-left space-y-2">
              <div class="inline-flex items-center gap-2 bg-teal-100 text-[#012831] border border-teal-300 px-3.5 py-1 rounded-full text-xs font-black tracking-wide">
                <span class="w-2.5 h-2.5 rounded-full bg-[#008CAC] animate-pulse"></span>
                REKOD DISAHKAN: ${matched.status}
              </div>

              <h3 class="text-2xl sm:text-3xl font-black text-[#012831] font-heading mt-1">${matched.name}</h3>
              <p class="text-sm font-bold text-[#008CAC]">${matched.role}</p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-slate-700">
                <div class="bg-[#f4f9fb] p-3 rounded-2xl border border-slate-200">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Nombor ID Staf Rasmi</div>
                  <div class="text-sm font-black text-[#012831] font-mono mt-0.5">${matched.id}</div>
                </div>
                <div class="bg-[#f4f9fb] p-3 rounded-2xl border border-slate-200">
                  <div class="text-[10px] uppercase font-bold text-slate-400">No. Telefon WhatsApp</div>
                  <div class="text-sm font-black text-[#012831] font-mono mt-0.5">${matched.phoneDisplay}</div>
                </div>
                <div class="bg-[#f4f9fb] p-3 rounded-2xl border border-slate-200">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Cawangan / Pejabat Operasi</div>
                  <div class="text-xs font-bold text-slate-800 mt-0.5">${matched.branch}</div>
                </div>
                <div class="bg-[#f4f9fb] p-3 rounded-2xl border border-slate-200">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Zon Liputan Khidmat</div>
                  <div class="text-xs font-bold text-slate-800 mt-0.5">${matched.zone}</div>
                </div>
              </div>

              <!-- Safety Guarantee Notice -->
              <div class="bg-teal-50/80 border border-teal-200 p-3.5 rounded-2xl text-xs text-[#012831] mt-4 leading-relaxed text-left">
                <strong>Pengesahan Keselamatan:</strong> ${matched.name} (${matched.id}) adalah wakil sah yang bertauliah di bawah Consult Plus. Beliau <strong>dilarang sama sekali</strong> meminta bayaran pendahuluan wang tunai atau meminta pemindahan wang ke akaun peribadi.
              </div>

              <!-- Contact Button -->
              <div class="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <a href="https://wa.me/${matched.phone}?text=Salam%20${encodeURIComponent(matched.name)}%20(ID:%20${matched.id}),%20saya%20telah%20mengesahkan%20profil%20tuan%20di%20portal%20Consult%20Plus%20dan%20ingin%20memohon%20konsultasi." target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center bg-[#FFE600] hover:bg-[#FFD200] text-[#012831] font-black text-sm px-6 py-3.5 rounded-xl shadow-lg transition gap-2">
                  <span>Hubungi ${matched.name.split(' ')[0]} di WhatsApp (${matched.phoneDisplay}) →</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      `;
    } else {
      resultContainer.innerHTML = `
        <div class="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 animate-fade-up">
          <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto">
            ✕
          </div>
          <div>
            <div class="inline-block bg-rose-200 text-rose-900 font-bold text-xs uppercase px-3 py-1 rounded-full mb-2">
              Status: Tidak Ditemui / Tidak Sah
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-rose-900 font-heading">
              Amaran: Tiada Rekod Ejen Ditemui Bagi "${query}"
            </h3>
            <p class="text-xs sm:text-sm text-rose-800 max-w-xl mx-auto mt-2 leading-relaxed">
              Individu ini <strong>TIDAK BERDAFTAR</strong> sebagai kakitangan atau konsultan sah Consult Plus. Jangan serahkan dokumen peribadi sulit (cth: Salinan IC, Slip Gaji, Penyata Bank) atau sebarang wang pendahuluan kepada individu ini.
            </p>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <a href="https://wa.me/${APP_CONFIG.whatsappNumber}?text=AMARAN%20SCAMMER:%20Saya%20ingin%20melaporkan%20individu%20yang%20mengaku%20sebagai%20ejen%20Consult%20Plus%20dengan%20maklumat:%20${encodeURIComponent(query)}" target="_blank" class="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition">
              Laporkan Ejen Palsu / Hubungi Hotline HQ
            </a>
            <button onclick="document.getElementById('agent-search-input').value=''; document.getElementById('verification-result').innerHTML='';" class="inline-flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition">
              Semak Semula
            </button>
          </div>
        </div>
      `;
    }

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}


