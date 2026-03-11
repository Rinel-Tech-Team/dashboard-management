# Frontend UI/UX & Navigation Plan — HR Management System

Proyek ini dimulai dari nol (greenfield). Rencana ini fokus pada arsitektur frontend, design system, navigasi, dan halaman-halaman UI **sebelum integrasi database**. Semua data akan menggunakan **dummy/mock data** terlebih dahulu.

---

## Visual Direction

Berikut adalah referensi mockup yang akan menjadi panduan desain:

````carousel
![Dashboard — Financial widgets, chart, project progress, recent transactions](C:\Users\DANIEL\.gemini\antigravity\brain\890f5150-0fe0-4a59-bcee-68894f2bf977\dashboard_mockup_1773117455753.png)
<!-- slide -->
![Employee Page — Data table dengan search, filter, dan status badge](C:\Users\DANIEL\.gemini\antigravity\brain\890f5150-0fe0-4a59-bcee-68894f2bf977\employee_page_mockup_1773117476276.png)
<!-- slide -->
![Project Page — Card grid dengan progress bar dan team avatars](C:\Users\DANIEL\.gemini\antigravity\brain\890f5150-0fe0-4a59-bcee-68894f2bf977\project_page_mockup_1773117491559.png)
````

**Design Pillars:**
- **Dark theme** — Navy background (`#0f172a`), soft glassmorphism cards
- **Accent colors** — Teal (`#14b8a6`) & Indigo (`#6366f1`)
- **Typography** — Google Fonts: **Inter** (body) + **Outfit** (headings)
- **Micro-animations** — Hover effects, smooth transitions, subtle entrance animations

---

## 1. Tech Stack & Project Init

| Layer | Pilihan |
|---|---|
| Framework | **Next.js 14+** (App Router) |
| Styling | **Vanilla CSS** (CSS Modules per komponen) |
| Icons | **Lucide React** (lightweight, consistent) |
| Charts | **Recharts** (simple, composable) |
| Font | Google Fonts — Inter + Outfit |
| Package Manager | npm |

### Langkah Inisialisasi

```bash
npx -y create-next-app@latest ./ --ts --app --eslint --src-dir --no-tailwind --import-alias "@/*"
npm install lucide-react recharts
```

---

## 2. Navigasi & Routing (App Router)

### Sidebar Navigation

| Icon | Label | Route | Keterangan |
|---|---|---|---|
| 🏠 `LayoutDashboard` | Dashboard | `/dashboard` | Halaman utama setelah login |
| 👥 `Users` | Karyawan | `/employees` | List + CRUD karyawan |
| 📁 `FolderKanban` | Proyek | `/projects` | List + detail proyek |
| 📄 `FileText` | Invoice | `/invoices` | List + generate invoice |
| 💰 `Wallet` | Kas & Tabungan | `/cash` | Saldo rekening + transaksi |
| ⚙️ `Settings` | Pengaturan | `/settings` | Profil perusahaan |

### Route Structure

```
src/app/
├── layout.tsx              ← Root layout (font, global CSS)
├── page.tsx                ← Redirect ke /dashboard
├── globals.css             ← CSS variables & design tokens
│
├── (auth)/
│   ├── layout.tsx          ← Auth layout (centered, no sidebar)
│   └── login/page.tsx
│
├── (main)/
│   ├── layout.tsx          ← Main layout (sidebar + topbar + content)
│   ├── dashboard/page.tsx
│   ├── employees/
│   │   ├── page.tsx        ← Employee list
│   │   ├── [id]/page.tsx   ← Employee detail
│   │   └── new/page.tsx    ← Add employee form
│   ├── projects/
│   │   ├── page.tsx        ← Project list (card grid)
│   │   ├── [id]/page.tsx   ← Project detail + team
│   │   └── new/page.tsx    ← Add project form
│   ├── invoices/
│   │   ├── page.tsx        ← Invoice list
│   │   ├── [id]/page.tsx   ← Invoice detail / preview
│   │   └── new/page.tsx    ← Generate invoice
│   ├── cash/
│   │   └── page.tsx        ← Cash accounts + transactions
│   └── settings/
│       └── page.tsx        ← Company profile
```

---

## 3. Layout Architecture

### A. Root Layout (`src/app/layout.tsx`)
- Memuat Google Fonts (Inter + Outfit)
- Load `globals.css`

### B. Auth Layout (`src/app/(auth)/layout.tsx`)
- Centered card, background gradient, no sidebar
- Untuk halaman login

### C. Main Layout (`src/app/(main)/layout.tsx`)
- **Sidebar** (kiri, 260px, collapsible ke 72px)
  - Logo + nama perusahaan
  - Navigation links dengan ikon + label
  - Active state indicator (highlight bar)
  - User info + logout di bagian bawah
- **Topbar** (atas, 64px)
  - Breadcrumb
  - Search bar (global search)
  - Notification bell
  - User avatar + dropdown
- **Content Area** (sisa area, scrollable, padding 24px)

---

## 4. Komponen UI (Component Library)

### Shared Components (`src/components/`)

| Komponen | Fungsi |
|---|---|
| `Sidebar` | Navigasi utama, collapsible |
| `Topbar` | Search, notifications, user menu |
| `StatCard` | Widget angka + ikon (Dashboard) |
| `DataTable` | Tabel reusable + sort + pagination |
| `StatusBadge` | Label warna (Active, Paid, Overdue, dll) |
| `ProgressBar` | Bar visual untuk budget/progress |
| `Modal` | Dialog untuk konfirmasi / form cepat |
| `PageHeader` | Judul halaman + tombol aksi |
| `EmptyState` | Placeholder saat data kosong |
| `FormField` | Input wrapper dengan label + error |

---

## 5. Detail Halaman

### 🏠 Dashboard (`/dashboard`)
- **Row 1:** 3× `StatCard` → Total Kas, Invoice Pending, Estimasi Profit
- **Row 2:** Line chart (tren pemasukan 6 bulan) + Payroll countdown widget
- **Row 3:** Project progress list (top 5 proyek aktif) + Recent transactions table

### 👥 Karyawan (`/employees`)
- `PageHeader` → "Karyawan" + tombol "Tambah Karyawan"
- Filter bar: Search input + dropdown departemen + dropdown status
- `DataTable` → kolom: Foto, Nama, Jabatan, Departemen, Status, Tanggal Masuk, Aksi
- `/employees/[id]` → Detail profil + riwayat proyek + konfigurasi gaji
- `/employees/new` → Form multi-field: nama, email, jabatan, departemen, gaji, tunjangan

### 📁 Proyek (`/projects`)
- `PageHeader` → "Proyek" + tombol "Proyek Baru"
- **Card Grid (2 kolom)** — tiap card menampilkan:
  - Nama proyek + klien
  - Budget (formatted Rp)
  - `ProgressBar` + persentase
  - `StatusBadge` (Planning / Development / Testing / Finished / Canceled)
  - Team member avatars (max 4 + "+N")
  - Deadline
- `/projects/[id]` → Detail, budget vs actual chart, team list, timeline
- `/projects/new` → Form: nama, klien, budget, deadline, pilih anggota tim

### 📄 Invoice (`/invoices`)
- `PageHeader` → "Invoice" + tombol "Buat Invoice"
- `DataTable` → No. Invoice, Proyek, Jumlah, Tanggal, Status (`StatusBadge`), Aksi
- Filter: Status (All / Unpaid / Partial / Paid / Overdue)
- `/invoices/[id]` → Preview invoice (layout cetak/PDF-ready)
- `/invoices/new` → Form: pilih proyek → auto-fill data + jumlah

### 💰 Kas & Tabungan (`/cash`)
- **Account Cards** — Tiap rekening: nama, saldo, ikon bank
- **Transaction Ledger** — Tabel kronologis:
  - Tanggal, Deskripsi, Kategori (`StatusBadge`), Jumlah (+/-), Saldo akhir
- Filter: rentang tanggal + kategori (Gaji, Sewa, Alat Kantor, Pembayaran Proyek)
- Tombol "Catat Pengeluaran" → Modal form

### ⚙️ Pengaturan (`/settings`)
- Form: Nama perusahaan, alamat, logo, tanggal gajian
- Section: Saldo awal kas/rekening

---

## 6. Design System — CSS Variables

```css
:root {
  /* Background */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: rgba(30, 41, 59, 0.7);
  --bg-hover: rgba(30, 41, 59, 0.9);

  /* Accents */
  --accent-teal: #14b8a6;
  --accent-indigo: #6366f1;
  --accent-teal-soft: rgba(20, 184, 166, 0.15);
  --accent-indigo-soft: rgba(99, 102, 241, 0.15);

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Status */
  --status-success: #22c55e;
  --status-warning: #f59e0b;
  --status-danger: #ef4444;
  --status-info: #3b82f6;

  /* Borders & Effects */
  --border-color: rgba(148, 163, 184, 0.1);
  --glass-blur: blur(12px);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.2);

  /* Spacing */
  --sidebar-width: 260px;
  --sidebar-collapsed: 72px;
  --topbar-height: 64px;

  /* Typography */
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Outfit', sans-serif;
}
```

---

## Proposed Changes

### Project Setup
#### [NEW] Next.js project files (via `create-next-app`)
Inisialisasi project Next.js dengan App Router, TypeScript, ESLint, `src/` directory.

---

### Design System & Globals
#### [NEW] [globals.css](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/app/globals.css)
CSS variables, reset styles, typography, utility classes, glassmorphism mixins, animation keyframes.

---

### Layout Components
#### [NEW] [layout.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/app/layout.tsx)
Root layout — font loading, global CSS import.

#### [NEW] [Sidebar.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/Sidebar.tsx)
Collapsible sidebar navigation component + CSS module.

#### [NEW] [Topbar.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/Topbar.tsx)
Search bar, notifications, user dropdown + CSS module.

#### [NEW] [main layout.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/app/(main)/layout.tsx)
Main authenticated layout wrapping Sidebar + Topbar + content.

#### [NEW] [auth layout.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/app/(auth)/layout.tsx)
Centered auth layout for login page.

---

### Shared UI Components
#### [NEW] [StatCard.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/StatCard.tsx)
#### [NEW] [DataTable.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/DataTable.tsx)
#### [NEW] [StatusBadge.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/StatusBadge.tsx)
#### [NEW] [ProgressBar.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/ProgressBar.tsx)
#### [NEW] [Modal.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/Modal.tsx)
#### [NEW] [PageHeader.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/PageHeader.tsx)
#### [NEW] [FormField.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/FormField.tsx)
#### [NEW] [EmptyState.tsx](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/components/EmptyState.tsx)

---

### Mock Data Layer
#### [NEW] [mockData.ts](file:///d:/DAMANNN%20D3TI/RINEL%20TECH%20NUSANTARA/Project/Internal/HR-Management/src/lib/mockData.ts)
Dummy data untuk employees, projects, invoices, transactions, accounts — dipakai sebelum integrasi Prisma.

---

### Page Files (per modul)
#### [NEW] Dashboard → `src/app/(main)/dashboard/page.tsx`
#### [NEW] Employee List → `src/app/(main)/employees/page.tsx`
#### [NEW] Employee Detail → `src/app/(main)/employees/[id]/page.tsx`
#### [NEW] Employee Form → `src/app/(main)/employees/new/page.tsx`
#### [NEW] Project List → `src/app/(main)/projects/page.tsx`
#### [NEW] Project Detail → `src/app/(main)/projects/[id]/page.tsx`
#### [NEW] Project Form → `src/app/(main)/projects/new/page.tsx`
#### [NEW] Invoice List → `src/app/(main)/invoices/page.tsx`
#### [NEW] Invoice Detail → `src/app/(main)/invoices/[id]/page.tsx`
#### [NEW] Invoice Form → `src/app/(main)/invoices/new/page.tsx`
#### [NEW] Cash Management → `src/app/(main)/cash/page.tsx`
#### [NEW] Settings → `src/app/(main)/settings/page.tsx`
#### [NEW] Login → `src/app/(auth)/login/page.tsx`

---

## Verification Plan

### Automated Tests
```bash
# Build check — memastikan semua halaman compile tanpa error
npm run build
```

### Browser Verification
Setelah semua halaman dibuat, saya akan menjalankan `npm run dev` dan menggunakan browser tool untuk:
1. Navigasi ke setiap halaman dan verifikasi rendering
2. Test sidebar collapse/expand
3. Verifikasi responsivitas di berbagai ukuran layar
4. Cek semua link navigasi berfungsi

### Manual Verification (oleh Daniel)
Setelah saya selesai, Daniel bisa:
1. Jalankan `npm run dev` dan buka `http://localhost:3000`
2. Klik setiap menu di sidebar untuk memastikan navigasi bekerja
3. Review tampilan visual setiap halaman — apakah sesuai ekspektasi
4. Cek responsivitas dengan resize browser window
