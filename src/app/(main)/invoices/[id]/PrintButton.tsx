'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/mockData';
import styles from './page.module.css';

interface PrintButtonProps {
  invoice: any;
  clientName: string;
}

export default function PrintButton({ invoice: inv, clientName }: PrintButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = async () => {
    try {
      setDownloading(true);
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById('pdf-invoice-content');
      
      const opt = {
        margin:       [10, 10, 10, 10] as [number, number, number, number], // top, left, bottom, right
        filename:     `Invoice-${inv.number}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      // Ensure it renders correctly by making it temporarily visible but off-screen
      if (element) {
        element.style.display = 'block';
        await html2pdf().set(opt).from(element).save();
        element.style.display = 'none';
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Gagal mengunduh PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={handlePrint}
        disabled={downloading}
      >
        <Printer size={16} /> {downloading ? 'Memproses PDF...' : 'Cetak / PDF'}
      </button>

      {/* Hidden container for PDF Generation */}
      {/* We use position absolute and visibility hidden so html2canvas can read dimensions but user doesn't see it */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
        <div id="pdf-invoice-content" style={{ display: 'none', background: 'white', padding: '40mm', color: '#1e293b', fontFamily: 'sans-serif' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #3b82f6', paddingBottom: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#2563eb', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>RINEL TECH NUSANTARA</h2>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0' }}>Email: mobilekreatif.nusantara@gmail.com</p>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>Telepon: +62 812-6079-9731</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ backgroundColor: '#f59e0b', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '6px 16px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                  {inv.title || 'INVOICE PEMBAYARAN'}
                </span>
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '2px' }}>INVOICE</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>#{inv.number}</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Tanggal: {formatDate(inv.issuedDate)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>DITAGIH KEPADA:</h4>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{clientName}</p>
              <p style={{ fontSize: '14px', color: '#475569' }}>Telepon: -</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>DETAIL PROJECT:</h4>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '6px' }}><strong style={{ color: '#0f172a' }}>Nama Project:</strong> {inv.projectName}</p>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '6px' }}><strong style={{ color: '#0f172a' }}>Periode:</strong> {formatDate(inv.projectStartDate)} - {formatDate(inv.projectDeadline)}</p>
              <p style={{ fontSize: '14px', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Jatuh Tempo:</strong> {formatDate(inv.dueDate)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'left' }}>Deskripsi Pekerjaan</th>
                  <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', width: '60px' }}>Qty</th>
                  <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', width: '150px' }}>Harga Satuan</th>
                  <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', width: '150px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Pembayaran Tagihan</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{inv.description || 'Pekerjaan Proyek'}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>1</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>
                    {formatCurrency(inv.amount)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>
                    {formatCurrency(inv.amount)}
                  </td>
                </tr>
                {/* Visual placeholder matching screenshot if details missing */}
                <tr style={{ backgroundColor: '#fef08a' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', borderBottom: '2px solid #3b82f6' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Additional Notes</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>As requested per project scope.</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'center', borderBottom: '2px solid #3b82f6', fontWeight: 'bold' }}>-</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'right', borderBottom: '2px solid #3b82f6', fontWeight: '500' }}>-</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', textAlign: 'right', borderBottom: '2px solid #3b82f6', fontWeight: '500' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ minWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#475569' }}>
                <span>Biaya Tagihan:</span>
                <span style={{ color: '#0f172a' }}>{formatCurrency(inv.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontSize: '16px', fontWeight: '800', color: '#2563eb', borderTop: '2px solid #3b82f6', borderBottom: '2px solid #3b82f6', marginTop: '8px' }}>
                <span style={{ textTransform: 'uppercase' }}>Total Yang Harus Dibayar:</span>
                <span>{formatCurrency(inv.amount - inv.paidAmount)}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '24px', marginBottom: '30px', borderLeft: '4px solid #3b82f6' }}>
            <h4 style={{ color: '#2563eb', fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Jadwal Pembayaran</h4>
            
            {inv.transactions?.map((t: any, i: number) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #bfdbfe' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>Pembayaran {i + 1} - {t.description}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Jatuh tempo: {formatDate(t.date)}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>{formatCurrency(t.amount)}</span>
                  <span style={{ fontSize: '12px', marginTop: '4px', color: '#10b981' }}>✓ Lunas</span>
                </div>
              </div>
            ))}
            
            {(inv.amount - inv.paidAmount > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 4px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>Pembayaran {(inv.transactions?.length || 0) + 1} - Sisa Pembayaran</span>
                  <span style={{ fontSize: '13px', color: '#2563eb', marginTop: '4px', fontWeight: '500' }}>Jatuh tempo: {formatDate(inv.dueDate)}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{formatCurrency(inv.amount - inv.paidAmount)}</span>
                  <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold', color: '#f59e0b' }}>• Invoice Ini</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '40px' }}>
            <h4 style={{ color: '#2563eb', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Informasi Pembayaran</h4>
            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '8px' }}><strong style={{ color: '#0f172a', display: 'inline-block', width: '130px' }}>Bank:</strong>Bank BCA</div>
            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '8px' }}><strong style={{ color: '#0f172a', display: 'inline-block', width: '130px' }}>Nama Rekening:</strong>DANIEL PANDAPOTAN MANALU</div>
            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '20px' }}><strong style={{ color: '#0f172a', display: 'inline-block', width: '130px' }}>Nomor Rekening:</strong>777-330-1648</div>
            
            <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>Catatan:</h5>
            <ul style={{ fontSize: '13px', color: '#475569', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Invoice ini merupakan tagihan untuk proyek berjalan.</li>
              <li>Pembayaran mohon dilakukan paling lambat tanggal <strong style={{ color: '#0f172a' }}>{formatDate(inv.dueDate)}</strong>.</li>
              <li>Konfirmasi pembayaran dapat dikirim ke nomor kontak yang tertera di atas.</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '16px 0', marginTop: 'auto' }}>
            <p style={{ margin: '0 0 6px 0' }}>Terima kasih atas kepercayaan Anda. Untuk pertanyaan, silakan hubungi kami.</p>
            <p style={{ margin: '0 0 6px 0' }}>Invoice ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#475569' }}>RINEL TECH NUSANTARA ©{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
