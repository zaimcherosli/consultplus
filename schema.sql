-- Cloudflare D1 SQL Schema for ConsultPlus CMS

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. General Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leadership & Consultants Table
CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    badge_label TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    image_url TEXT,
    card_color TEXT DEFAULT 'bg-brand-navy',
    badge_color TEXT DEFAULT 'bg-brand-yellow',
    display_order INTEGER DEFAULT 1,
    status TEXT DEFAULT 'AKTIF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads / Loan Eligibility Submissions Table
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    sector TEXT NOT NULL,
    salary TEXT,
    loan_amount TEXT,
    loan_purpose TEXT DEFAULT 'Penyatuan Hutang',
    credit_issues TEXT,
    assigned_consultant_id INTEGER,
    status TEXT DEFAULT 'BARU', -- BARU, DALAM SEMAKAN, HANTAR KE BANK, LULUS, DITOLAK
    notes TEXT,
    source TEXT DEFAULT 'Borang Semakan Kelayakan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assigned_consultant_id) REFERENCES team_members(id)
);

-- 5. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    profession TEXT NOT NULL,
    original_issue TEXT NOT NULL,
    loan_approved TEXT NOT NULL,
    monthly_savings TEXT,
    story TEXT,
    is_featured INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data
-- Default Admin: admin / ConsultPlus2026!
INSERT OR IGNORE INTO admins (id, username, password_hash, full_name, role) VALUES 
(1, 'admin', '660e512b6206f70ee837a9f2e5f52822903052edc594ef59b7937cb0a6615eb4', 'Admin ConsultPlus', 'superadmin');

-- Site Settings
INSERT OR REPLACE INTO site_settings (key, value, description) VALUES
('whatsapp_number', '601171191170', 'Nombor WhatsApp Utama ConsultPlus'),
('phone_display', '+6011-7119 1170', 'Paparan Nombor Telefon Hotline'),
('email', 'support@consultplus.my', 'Emel Rasmi ConsultPlus'),
('office_hours', 'Isnin - Jumaat: 9:00 AM - 6:00 PM', 'Waktu Operasi Pejabat'),
('min_interest_rate', '2.95%', 'Kadar Keuntungan Minimum Paparan'),
('max_loan_amount', 'RM300,000', 'Had Pembiayaan Maksimum'),
('announcement_text', '100% Panel Bank Berlesen | Tiada Caj Wang Pendahuluan | Kelulusan 24-48 Jam', 'Teks Pengumuman Bar Atas'),
('announcement_active', '1', 'Status Paparan Bar Pengumuman');

-- Seed Team Members
INSERT OR REPLACE INTO team_members (id, name, title, role, badge_label, phone, email, image_url, card_color, badge_color, display_order, status) VALUES
(1, 'Tn. Zaim Rosli', 'CEO & Pengasas', 'Ketua Eksekutif', 'CEO & Pengasas', '601171191170', 'zaim@consultplus.my', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 'bg-brand-yellow', 'bg-brand-navyDeep text-brand-yellow', 1, 'AKTIF'),
(2, 'Pn. Sarah Iskandar', 'Pengarah Urusan', 'Managing Director', 'Pengarah Urusan', '601171191170', 'sarah@consultplus.my', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80', 'bg-brand-navyDeep', 'bg-brand-yellow text-brand-navyDeep', 2, 'AKTIF'),
(3, 'En. Razif Rahman', 'Hubungan Bank', 'Banking Relations Lead', 'Hubungan Bank', '601171191170', 'razif@consultplus.my', 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80', 'bg-brand-navy', 'bg-brand-yellow text-brand-navyDeep', 3, 'AKTIF'),
(4, 'Pn. Faridah Hanum', 'Pengurus Risiko', 'Credit Risk Manager', 'Pengurus Risiko', '601171191170', 'faridah@consultplus.my', 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80', 'bg-brand-navy', 'bg-brand-yellow text-brand-navyDeep', 4, 'AKTIF'),
(5, 'En. Amirul Haziq', 'Ketua SME', 'SME Financing Lead', 'Ketua SME', '601171191170', 'amirul@consultplus.my', 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&q=80', 'bg-brand-blueAccent', 'bg-brand-navy text-white', 5, 'AKTIF'),
(6, 'Cik Aina Melissa', 'Pakar Refinance', 'Mortgage Lead', 'Pakar Refinance', '601171191170', 'aina@consultplus.my', 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80', 'bg-brand-yellow', 'bg-brand-navyDeep text-white', 6, 'AKTIF');

-- Seed Testimonials
INSERT OR REPLACE INTO testimonials (id, client_name, profession, original_issue, loan_approved, monthly_savings, story, is_featured, display_order) VALUES
(1, 'Encik Azman & Isteri', 'Eksekutif Swasta (MNC)', 'Komitmen Tinggi & CCRIS Kad Kredit', 'RM 145,000', 'RM 1,850 / bulan', 'Alhamdulillah ConsultPlus bantu satukan 4 kad kredit & 2 pinjaman peribadi kepada satu akaun dengan faedah jauh lebih rendah. Aliran tunai bulanan kami kembali lega.', 1, 1),
(2, 'Puan Rozita Ahmad', 'Kakitangan Kerajaan (KKM)', 'Potongan Gaji Angkasa 60% DSR Penuh', 'RM 95,000', 'RM 920 / bulan', 'Sangat profesional! Walaupun slip gaji saya dah hampir 60%, perunding ConsultPlus dapat bantu skim khas penyatuan hutang luar tanpa upfront fee.', 1, 2),
(3, 'Tuan Haji Ridzuan', 'Pemilik Restoran & Katering', 'Perlukan Modal Pusingan Segera', 'RM 220,000', 'Kelulusan 48 Jam', 'Urusan sangat pantas. Dokumen syarikat disemak rapi dan kelulusan pembiayaan SME diperolehi dalam 2 hari bekerja sahaja.', 1, 3);
