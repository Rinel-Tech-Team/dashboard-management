'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, FileText } from 'lucide-react';
import Topbar from '@/components/Topbar';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { getPayrollById } from '@/actions/payroll';
import { formatDate } from '@/lib/mockData';
import detailStyles from '../../invoices/[id]/page.module.css';

// Reusable formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PayrollDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPayrollById(id);
        if (res.success && res.payroll) {
          setPayroll(res.payroll);
        } else {
          setError(res.error || 'Data tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  if (error || !payroll) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <>
      <Topbar title="Detail Payroll" />
      <div className={detailStyles.page}>
        <Link href="/payroll" className={detailStyles.backLink}>
          <ArrowLeft size={16} /> Kembali ke Payroll
        </Link>
        <PageHeader
          title={`Detail Payroll`}
          subtitle={`Periode: ${payroll.period}`}
          actionLabel="Edit Payroll"
          actionHref={`/payroll/${id}/edit`}
          actionIcon={<Pencil size={16} />}
        />

        <div className={`card ${detailStyles.mainDetailCard}`}>
          <div className={detailStyles.detailHeader}>
            <div>
              <h2 className={detailStyles.invoiceTitleMain}>{payroll.type}</h2>
              <div className={detailStyles.invoiceNumberMain}>ID: {payroll.id}</div>
            </div>
            <StatusBadge label={payroll.status} />
          </div>

          <div className={detailStyles.detailGrid}>
            <div className={detailStyles.detailItem}>
              <span className={detailStyles.detailLabel}>Tanggal Eksekusi</span>
              <span className={detailStyles.detailValue}>{formatDate(payroll.date)}</span>
            </div>
            <div className={detailStyles.detailItem}>
              <span className={detailStyles.detailLabel}>Periode</span>
              <span className={detailStyles.detailValue}>{payroll.period}</span>
            </div>
            <div className={detailStyles.detailItem}>
              <span className={detailStyles.detailLabel}>Sumber Rekening</span>
              <span className={detailStyles.detailValue}>{payroll.account?.name} ({payroll.account?.bank})</span>
            </div>
            <div className={detailStyles.detailItem}>
              <span className={detailStyles.detailLabel}>Total Dibayar</span>
              <span className={detailStyles.detailValueBold} style={{ color: 'var(--accent-indigo)' }}>
                {formatCurrency(Number(payroll.totalAmount))}
              </span>
            </div>
            <div className={detailStyles.detailItem}>
              <span className={detailStyles.detailLabel}>Karyawan</span>
              <span className={detailStyles.detailValue}>{payroll.employeeCount} Orang</span>
            </div>
          </div>

          {payroll.notes && (
            <div className={detailStyles.descriptionBox} style={{ marginBottom: '24px' }}>
              <div className={detailStyles.detailLabel}>Catatan:</div>
              <div className={detailStyles.descriptionText}>{payroll.notes}</div>
            </div>
          )}

          {payroll.proofUrl && (
            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Bukti Transfer
              </h4>
              <img src={payroll.proofUrl} alt="Bukti Pembayaran" style={{ maxWidth: '400px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
            </div>
          )}
        </div>

        <h3 className={detailStyles.sectionTitle} style={{ marginTop: '20px' }}>Daftar Karyawan</h3>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>KARYAWAN</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>POSISI</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>PENDAPATAN (Estimasi)</th>
              </tr>
            </thead>
            <tbody>
              {payroll.details.map((detail: any) => (
                <tr key={detail.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{detail.employee?.name || 'Unknown'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{detail.employee?.position || '-'}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatCurrency(Number(detail.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
