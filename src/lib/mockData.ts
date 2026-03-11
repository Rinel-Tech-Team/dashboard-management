// ============================
// Mock Data for HR Management
// ============================

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: 'active' | 'inactive' | 'cuti' | 'resign';
  joinDate: string;
  salary: number;
  allowance: number;
  avatar: string;
  phone: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  status: 'planning' | 'development' | 'testing' | 'finished' | 'canceled';
  startDate: string;
  deadline: string;
  progress: number;
  teamIds: string[];
  description: string;
}

export interface Invoice {
  id: string;
  number: string;
  projectId: string;
  projectName: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  issuedDate: string;
  dueDate: string;
  description: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  accountId: string;
}

export interface CashAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  icon: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
}

// ---- Employee Data ----
export const employees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Ahmad Fauzan',
    email: 'ahmad.fauzan@rinel.id',
    position: 'Senior Developer',
    department: 'Engineering',
    status: 'active',
    joinDate: '2023-01-15',
    salary: 12000000,
    allowance: 2000000,
    avatar: 'AF',
    phone: '0812-3456-7890',
  },
  {
    id: 'emp-002',
    name: 'Siti Rahmawati',
    email: 'siti.rahmawati@rinel.id',
    position: 'UI/UX Designer',
    department: 'Design',
    status: 'active',
    joinDate: '2023-03-20',
    salary: 10000000,
    allowance: 1500000,
    avatar: 'SR',
    phone: '0813-5678-9012',
  },
  {
    id: 'emp-003',
    name: 'Budi Santoso',
    email: 'budi.santoso@rinel.id',
    position: 'Project Manager',
    department: 'Management',
    status: 'active',
    joinDate: '2022-08-10',
    salary: 15000000,
    allowance: 3000000,
    avatar: 'BS',
    phone: '0814-6789-0123',
  },
  {
    id: 'emp-004',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@rinel.id',
    position: 'Frontend Developer',
    department: 'Engineering',
    status: 'active',
    joinDate: '2023-06-01',
    salary: 9000000,
    allowance: 1500000,
    avatar: 'DL',
    phone: '0815-7890-1234',
  },
  {
    id: 'emp-005',
    name: 'Rizki Pratama',
    email: 'rizki.pratama@rinel.id',
    position: 'Backend Developer',
    department: 'Engineering',
    status: 'active',
    joinDate: '2023-09-15',
    salary: 11000000,
    allowance: 2000000,
    avatar: 'RP',
    phone: '0816-8901-2345',
  },
  {
    id: 'emp-006',
    name: 'Nurul Hidayah',
    email: 'nurul.hidayah@rinel.id',
    position: 'QA Engineer',
    department: 'Engineering',
    status: 'cuti',
    joinDate: '2022-11-01',
    salary: 8500000,
    allowance: 1500000,
    avatar: 'NH',
    phone: '0817-9012-3456',
  },
  {
    id: 'emp-007',
    name: 'Fajar Ramadhan',
    email: 'fajar.ramadhan@rinel.id',
    position: 'DevOps Engineer',
    department: 'Engineering',
    status: 'active',
    joinDate: '2024-01-10',
    salary: 13000000,
    allowance: 2500000,
    avatar: 'FR',
    phone: '0818-0123-4567',
  },
  {
    id: 'emp-008',
    name: 'Maya Putri',
    email: 'maya.putri@rinel.id',
    position: 'HR Specialist',
    department: 'HR',
    status: 'resign',
    joinDate: '2023-02-14',
    salary: 8000000,
    allowance: 1500000,
    avatar: 'MP',
    phone: '0819-1234-5678',
  },
];

// ---- Project Data ----
export const projects: Project[] = [
  {
    id: 'proj-001',
    name: 'Sistem POS Retail',
    client: 'PT Maju Bersama',
    budget: 150000000,
    spent: 85000000,
    status: 'development',
    startDate: '2025-10-01',
    deadline: '2026-04-30',
    progress: 62,
    teamIds: ['emp-001', 'emp-004', 'emp-005', 'emp-003'],
    description: 'Pengembangan sistem Point of Sale untuk jaringan retail dengan fitur inventory management.',
  },
  {
    id: 'proj-002',
    name: 'E-Commerce Platform',
    client: 'CV Nusantara Digital',
    budget: 250000000,
    spent: 250000000,
    status: 'finished',
    startDate: '2025-03-15',
    deadline: '2025-12-31',
    progress: 100,
    teamIds: ['emp-001', 'emp-002', 'emp-004', 'emp-005', 'emp-007'],
    description: 'Platform e-commerce lengkap dengan payment gateway dan CMS.',
  },
  {
    id: 'proj-003',
    name: 'Mobile Banking App',
    client: 'Bank Harmoni',
    budget: 500000000,
    spent: 120000000,
    status: 'planning',
    startDate: '2026-03-01',
    deadline: '2026-12-31',
    progress: 15,
    teamIds: ['emp-003', 'emp-001', 'emp-007'],
    description: 'Aplikasi mobile banking dengan fitur transfer, QRIS, dan virtual account.',
  },
  {
    id: 'proj-004',
    name: 'Dashboard Analytics',
    client: 'PT Data Nusantara',
    budget: 80000000,
    spent: 60000000,
    status: 'testing',
    startDate: '2025-11-15',
    deadline: '2026-03-15',
    progress: 88,
    teamIds: ['emp-004', 'emp-002', 'emp-005'],
    description: 'Dashboard analitik real-time untuk monitoring KPI perusahaan.',
  },
  {
    id: 'proj-005',
    name: 'Website Redesign',
    client: 'Klinik Sehat Sentosa',
    budget: 35000000,
    spent: 10000000,
    status: 'canceled',
    startDate: '2025-09-01',
    deadline: '2025-12-31',
    progress: 25,
    teamIds: ['emp-002', 'emp-004'],
    description: 'Redesign website klinik dengan fitur booking online.',
  },
  {
    id: 'proj-006',
    name: 'ERP Internal',
    client: 'Rinel Tech Nusantara',
    budget: 0,
    spent: 0,
    status: 'development',
    startDate: '2026-01-01',
    deadline: '2026-06-30',
    progress: 40,
    teamIds: ['emp-001', 'emp-003', 'emp-004', 'emp-005', 'emp-007'],
    description: 'Sistem HR & ERP internal untuk manajemen perusahaan.',
  },
];

// ---- Invoice Data ----
export const invoices: Invoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2026-001',
    projectId: 'proj-001',
    projectName: 'Sistem POS Retail',
    amount: 75000000,
    paidAmount: 75000000,
    status: 'paid',
    issuedDate: '2025-12-01',
    dueDate: '2026-01-01',
    description: 'Pembayaran termin pertama — Sistem POS Retail',
  },
  {
    id: 'inv-002',
    number: 'INV-2026-002',
    projectId: 'proj-001',
    projectName: 'Sistem POS Retail',
    amount: 75000000,
    paidAmount: 0,
    status: 'pending',
    issuedDate: '2026-03-01',
    dueDate: '2026-04-01',
    description: 'Pembayaran termin kedua — Sistem POS Retail',
  },
  {
    id: 'inv-003',
    number: 'INV-2026-003',
    projectId: 'proj-002',
    projectName: 'E-Commerce Platform',
    amount: 125000000,
    paidAmount: 125000000,
    status: 'paid',
    issuedDate: '2025-06-15',
    dueDate: '2025-07-15',
    description: 'Pembayaran termin pertama — E-Commerce Platform',
  },
  {
    id: 'inv-004',
    number: 'INV-2026-004',
    projectId: 'proj-002',
    projectName: 'E-Commerce Platform',
    amount: 125000000,
    paidAmount: 125000000,
    status: 'paid',
    issuedDate: '2025-12-01',
    dueDate: '2025-12-31',
    description: 'Pembayaran termin kedua — E-Commerce Platform',
  },
  {
    id: 'inv-005',
    number: 'INV-2026-005',
    projectId: 'proj-003',
    projectName: 'Mobile Banking App',
    amount: 200000000,
    paidAmount: 100000000,
    status: 'partial',
    issuedDate: '2026-02-15',
    dueDate: '2026-03-15',
    description: 'Down payment — Mobile Banking App',
  },
  {
    id: 'inv-006',
    number: 'INV-2026-006',
    projectId: 'proj-004',
    projectName: 'Dashboard Analytics',
    amount: 40000000,
    paidAmount: 40000000,
    status: 'paid',
    issuedDate: '2025-12-15',
    dueDate: '2026-01-15',
    description: 'Pembayaran termin pertama — Dashboard Analytics',
  },
  {
    id: 'inv-007',
    number: 'INV-2026-007',
    projectId: 'proj-004',
    projectName: 'Dashboard Analytics',
    amount: 40000000,
    paidAmount: 0,
    status: 'overdue',
    issuedDate: '2026-02-01',
    dueDate: '2026-03-01',
    description: 'Pembayaran termin kedua — Dashboard Analytics',
  },
];

// ---- Cash Account Data ----
export const cashAccounts: CashAccount[] = [
  {
    id: 'acc-001',
    name: 'Uang Kas Kecil',
    bank: 'Cash',
    balance: 15000000,
    icon: '💵',
  },
  {
    id: 'acc-002',
    name: 'BCA',
    bank: 'BCA',
    balance: 385000000,
    icon: '🏦',
  },
  {
    id: 'acc-003',
    name: 'BNI',
    bank: 'BNI',
    balance: 80000000,
    icon: '🏦',
  },
  {
    id: 'acc-004',
    name: 'BRI',
    bank: 'BRI',
    balance: 45000000,
    icon: '🏦',
  },
  {
    id: 'acc-005',
    name: 'Mandiri',
    bank: 'Mandiri',
    balance: 120000000,
    icon: '🏦',
  },
];

// ---- Transaction Data ----
export const transactions: Transaction[] = [
  {
    id: 'trx-001',
    date: '2026-03-09',
    description: 'Pembayaran Invoice INV-2026-005 (partial)',
    category: 'Pembayaran Proyek',
    type: 'income',
    amount: 100000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-002',
    date: '2026-03-05',
    description: 'Transfer dana ke BNI',
    category: 'Transfer Keluar',
    type: 'expense',
    amount: 25000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-003',
    date: '2026-03-03',
    description: 'Saldo Kas Kecil — top up',
    category: 'Kas Kecil',
    type: 'expense',
    amount: 5000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-004',
    date: '2026-03-01',
    description: 'Pembelian alat kantor & monitor',
    category: 'Lainnya',
    type: 'expense',
    amount: 8500000,
    accountId: 'acc-001',
  },
  {
    id: 'trx-005',
    date: '2026-02-28',
    description: 'Transfer masuk dari rekening lain',
    category: 'Transfer Masuk',
    type: 'income',
    amount: 40000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-006',
    date: '2026-02-25',
    description: 'Setoran tabungan bulanan',
    category: 'Tabungan',
    type: 'expense',
    amount: 10000000,
    accountId: 'acc-005',
  },
  {
    id: 'trx-007',
    date: '2026-02-20',
    description: 'Transfer masuk dari BRI',
    category: 'Transfer Masuk',
    type: 'income',
    amount: 75000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-008',
    date: '2026-02-15',
    description: 'Pengeluaran kas kecil harian',
    category: 'Kas Kecil',
    type: 'expense',
    amount: 2000000,
    accountId: 'acc-001',
  },
  {
    id: 'trx-009',
    date: '2026-02-05',
    description: 'Transfer dana ke Mandiri',
    category: 'Transfer Keluar',
    type: 'expense',
    amount: 30000000,
    accountId: 'acc-002',
  },
  {
    id: 'trx-010',
    date: '2026-01-28',
    description: 'Setoran tabungan',
    category: 'Tabungan',
    type: 'expense',
    amount: 15000000,
    accountId: 'acc-005',
  },
];

// ---- Helper Functions ----
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find(emp => emp.id === id);
}

export function getProjectTeam(projectId: string): Employee[] {
  const project = projects.find(p => p.id === projectId);
  if (!project) return [];
  return project.teamIds.map(id => getEmployeeById(id)).filter(Boolean) as Employee[];
}

// Revenue data for chart
export const revenueData = [
  { month: 'Okt', income: 0, expense: 80000000 },
  { month: 'Nov', income: 0, expense: 85000000 },
  { month: 'Des', income: 240000000, expense: 95000000 },
  { month: 'Jan', income: 125000000, expense: 90000000 },
  { month: 'Feb', income: 115000000, expense: 82000000 },
  { month: 'Mar', income: 100000000, expense: 103500000 },
];

// Departments for filter
export const departments: Department[] = [
  { id: 'dept-001', name: 'Engineering', description: 'Tim pengembangan dan infrastruktur', head: 'Ahmad Fauzan' },
  { id: 'dept-002', name: 'Design', description: 'Tim UI/UX dan creative design', head: 'Siti Rahmawati' },
  { id: 'dept-003', name: 'Management', description: 'Manajemen proyek dan operasional', head: 'Budi Santoso' },
  { id: 'dept-004', name: 'HR', description: 'Human Resources dan rekrutmen', head: '-' },
  { id: 'dept-005', name: 'Finance', description: 'Keuangan, invoice, dan kas', head: '-' },
];

// Employee statuses
export const employeeStatuses = ['active', 'inactive', 'cuti', 'resign'] as const;

// Project statuses  
export const projectStatuses = ['planning', 'development', 'testing', 'finished', 'canceled'] as const;

// Invoice statuses
export const invoiceStatuses = ['pending', 'partial', 'paid', 'overdue'] as const;

// Transaction categories (for Kas & Tabungan only)
export const transactionCategories = ['Kas Kecil', 'Tabungan', 'Transfer Keluar', 'Transfer Masuk', 'Lainnya'] as const;

// Payroll types
export const payrollTypes = ['Gaji Bulanan', 'THR/Bonus', 'Lembur/Tambahan'] as const;

// Transaction module types
export const transactionTypes = ['Sewa', 'Operasional', 'Pembayaran Proyek'] as const;
