'use client';

import dynamic from 'next/dynamic';
import {
  Wallet,
  FileText,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { formatCurrency, formatDate } from '@/lib/mockData';
import styles from './page.module.css';

// Dynamically import the chart — recharts is large and doesn't need to block initial paint
const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 260, borderRadius: 8, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  ),
});

interface DashboardData {
  totalCash: number;
  pendingCount: number;
  pendingAmount: number;
  estimatedProfit: number;
  activeProjects: any[];
  recentTransactions: any[];
  payrollDay: number;
  chartData: any[];
  cashGrowth: number;
  activeEmployees: number;
  totalMonthlySalary: number;
}

export default function DashboardContent({ data }: { data: DashboardData }) {
  const {
    totalCash,
    pendingCount,
    pendingAmount,
    estimatedProfit,
    activeProjects,
    recentTransactions,
    payrollDay,
    chartData,
    cashGrowth,
    activeEmployees,
    totalMonthlySalary
  } = data;

  // Payroll countdown
  const today = new Date();
  const payrollDate = new Date(today.getFullYear(), today.getMonth(), payrollDay);
  if (today.getDate() > payrollDay) {
    payrollDate.setMonth(payrollDate.getMonth() + 1);
  }
  const daysToPayroll = Math.ceil(
    (payrollDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <Topbar title="Dashboard" subtitle="Selamat datang kembali, Admin 👋" />
      <div className={styles.page}>
        {/* Stat Cards */}
        <div className={`${styles.statsGrid} stagger-children`}>
          <StatCard
            icon={<Wallet size={22} />}
            label="Total Kas"
            value={formatCurrency(totalCash)}
            change={`${cashGrowth >= 0 ? '+' : ''}${cashGrowth.toFixed(1)}% dari bulan lalu`}
            changeType={cashGrowth >= 0 ? 'positive' : 'negative'}
            accent="teal"
          />
          <StatCard
            icon={<FileText size={22} />}
            label="Invoice Pending"
            value={formatCurrency(pendingAmount || 0)}
            change={`${pendingCount || 0} invoice belum lunas`}
            changeType="negative"
            accent="warning"
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Estimasi Profit"
            value={formatCurrency(estimatedProfit || 0)}
            change="Berdasarkan semua transaksi"
            changeType="neutral"
            accent="indigo"
          />
          <StatCard
            icon={<Calendar size={22} />}
            label="Payroll Countdown"
            value={`${daysToPayroll} Hari`}
            change={`Tanggal ${payrollDay} setiap bulan`}
            changeType="neutral"
            accent="teal"
          />
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          {/* Revenue Chart */}
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.cardTitle}>Tren Pemasukan & Pengeluaran</h3>
            <p className={styles.cardSubtitle}>12 bulan terakhir</p>
            <div className={styles.chartWrap}>
              <DashboardChart data={chartData} />
            </div>
          </div>

          {/* Payroll Info */}
          <div className={`card ${styles.payrollCard}`}>
            <h3 className={styles.cardTitle}>Info Gajian</h3>
            <div className={styles.payrollCountdown}>
              <Clock size={40} className={styles.payrollIcon} />
              <span className={styles.payrollDays}>{daysToPayroll}</span>
              <span className={styles.payrollLabel}>hari menuju gajian</span>
            </div>
            <div className={styles.payrollDetails}>
              <div className={styles.payrollRow}>
                <span>Total Gaji Bulanan</span>
                <span className={styles.payrollValue}>{formatCurrency(totalMonthlySalary)}</span>
              </div>
              <div className={styles.payrollRow}>
                <span>Jumlah Karyawan Aktif</span>
                <span className={styles.payrollValue}>{activeEmployees} orang</span>
              </div>
              <div className={styles.payrollRow}>
                <span>Tanggal Gajian</span>
                <span className={styles.payrollValue}>{payrollDay} setiap bulan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          {/* Active Projects */}
          <div className={`card ${styles.projectsCard}`}>
            <h3 className={styles.cardTitle}>Proyek Aktif</h3>
            <div className={styles.projectsList}>
              {activeProjects?.map((project: any) => (
                <div key={project.id} className={styles.projectItem}>
                  <div className={styles.projectInfo}>
                    <span className={styles.projectName}>{project.name}</span>
                    <span className={styles.projectClient}>{project.client}</span>
                  </div>
                  <StatusBadge label={project.status} />
                  <div className={styles.projectProgress}>
                    <ProgressBar progress={project.progress} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className={`card ${styles.transactionsCard}`}>
            <h3 className={styles.cardTitle}>Transaksi Terakhir</h3>
            <div className={styles.transactionsList}>
              {recentTransactions?.map((trx: any) => (
                <div key={trx.id} className={styles.trxItem}>
                  <div
                    className={`${styles.trxIcon} ${
                      trx.type === 'income' ? styles.trxIncome : styles.trxExpense
                    }`}
                  >
                    {trx.type === 'income' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                  <div className={styles.trxInfo}>
                    <span className={styles.trxDesc}>{trx.description}</span>
                    <span className={styles.trxDate}>{formatDate(trx.date)}</span>
                  </div>
                  <span
                    className={`${styles.trxAmount} ${
                      trx.type === 'income' ? styles.trxIncome : styles.trxExpense
                    }`}
                  >
                    {trx.type === 'income' ? '+' : '-'}
                    {formatCurrency(trx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
