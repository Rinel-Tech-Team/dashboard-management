import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import Topbar from '@/components/Topbar';

import styles from './page.module.css';
import { formatCurrency, formatDate } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';
import { getInvoiceById } from '@/actions/invoices';
import PrintButton from './PrintButton';



export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const inv = await getInvoiceById(resolvedParams.id);

  if (!inv) {
    return (
      <>
        <Topbar title="Invoice" />
        <div className={styles.page}>
          <p>Invoice tidak ditemukan.</p>
          <Link href="/invoices" className="btn btn-secondary">Kembali</Link>
        </div>
      </>
    );
  }

  const clientName = inv.clientName || '-';
  const payments = inv.transactions || [];

  return (
    <>
      <Topbar title="Detail Invoice" />
      <div className={styles.page}>
        <div className={styles.topActions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/invoices" className={styles.backLink}>
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <PrintButton invoice={inv} clientName={clientName} />
          </div>
        </div>

        {/* Detailed Invoice Info Card */}
        <div className={`card ${styles.mainDetailCard}`}>
          
          <div className={styles.detailHeader}>
            <div>
              <h2 className={styles.invoiceTitleMain}>{inv.projectName}</h2>
              <p className={styles.invoiceNumberMain}>Invoice #{inv.number}</p>
            </div>
            <div className={styles.statusWrap}>
              <StatusBadge label={inv.status} />
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Klien</span>
              <span className={styles.detailValueBold}>{clientName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Total Tagihan</span>
              <span className={`${styles.detailValue} ${styles.mono} ${styles.textLg}`}>{formatCurrency(inv.amount)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Telah Dibayar</span>
              <span className={`${styles.detailValue} ${styles.mono} ${styles.textSuccess}`}>{formatCurrency(inv.paidAmount)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Sisa Tagihan</span>
              <span className={`${styles.detailValue} ${styles.mono} ${styles.textWarning}`}>{formatCurrency(inv.amount - inv.paidAmount)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Tanggal Dibuat</span>
              <span className={styles.detailValue}>{formatDate(inv.issuedDate)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Tanggal Jatuh Tempo</span>
              <span className={styles.detailValue}>{formatDate(inv.dueDate)}</span>
            </div>
          </div>

          <div className={styles.descriptionBox}>
            <span className={styles.detailLabel}>Deskripsi Pekerjaan:</span>
            <p className={styles.descriptionText}>{inv.description || 'Tidak ada deskripsi detail.'}</p>
          </div>
        </div>

        {/* Payment History Modern Cards */}
        {payments.length > 0 && (
          <div className={styles.paymentSection}>
            <h3 className={styles.sectionTitle}>Riwayat Pembayaran ({payments.length})</h3>
            
            <div className={styles.paymentCardsGrid}>
              {payments.map((pay, idx) => (
                <div key={pay.id} className={`card ${styles.paymentCard}`}>
                  <div className={styles.paymentCardHeader}>
                    <div className={styles.paymentCardBadge}>Pembayaran {idx + 1}</div>
                    <StatusBadge label="paid" />
                  </div>
                  <div className={styles.paymentCardBody}>
                    <h4 className={styles.paymentCardTitle}>{pay.description || 'Pembayaran Proyek'}</h4>
                    <p className={styles.paymentCardDate}>{formatDate(pay.date)}</p>
                  </div>
                  <div className={styles.paymentCardFooter}>
                    <span className={styles.paymentCardAmountLabel}>Jumlah Dibayar:</span>
                    <span className={`${styles.paymentCardAmount} ${styles.mono}`}>{formatCurrency(pay.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
