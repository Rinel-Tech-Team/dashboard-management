'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, AlertCircle, UploadCloud, X } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { payrollTypes } from '@/lib/mockData'; // Can still use static types here or move to DB
import { uploadProofFile } from '@/actions/upload';
import { createPayroll } from '@/actions/payroll';
import { getEmployees } from '@/actions/employees';
import { getCashAccounts } from '@/actions/cash';
import styles from './page.module.css';

// Formatting helper
const formatRupiah = (value: string | number) => {
  if (!value) return '';
  const numberStr = value.toString().replace(/[^,\d]/g, '');
  const parts = numberStr.split(',');
  const sisa = parts[0].length % 3;
  let rupiah = parts[0].substr(0, sisa);
  const ribuan = parts[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = parts[1] != undefined ? rupiah + ',' + parts[1] : rupiah;
  return 'Rp ' + rupiah;
};

const parseRupiah = (formattedValue: string) => {
  return parseFloat(formattedValue.replace(/[^0-9]/g, '')) || 0;
};

export default function NewPayrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [employees, setEmployees] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  // Form states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([payrollTypes[0]]);
  const [accountId, setAccountId] = useState('');
  const [period, setPeriod] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Employee Selection states
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, accRes] = await Promise.all([
          getEmployees(),
          getCashAccounts()
        ]);
        if (empRes && Array.isArray(empRes)) {
          setEmployees(empRes.filter((e: any) => e.status === 'active'));
        }
        if (accRes.success && accRes.accounts) {
          setCashAccounts(accRes.accounts);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    emp.position.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes(prev => 
      prev.includes(t) 
        ? prev.filter(x => x !== t) 
        : [...prev, t]
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selected);
      } else {
        setImagePreview(null);
      }
    } else {
      setFile(null);
      setImagePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !period || !date || selectedIds.length === 0 || selectedTypes.length === 0) {
      setError('Harap lengkapi semua field yang wajib dan pilih setidaknya satu karyawan serta satu tipe payroll.');
      return;
    }

    const typeString = selectedTypes.join(', ');

    // Calculate total bayar
    let rawTotal = 0;
    const isLemburOnly = selectedTypes.length === 1 && selectedTypes.includes('Lembur/Tambahan');
    const includesLembur = selectedTypes.includes('Lembur/Tambahan');
    const includesGaji = selectedTypes.includes('Gaji Bulanan');
    const includesTHR = selectedTypes.includes('THR/Bonus');

    // Basic sum per employee depending on type
    const employeeBaseSum = selectedIds.reduce((sum, id) => {
      const emp = employees.find(e => e.id === id);
      if (emp) {
        let empAmount = 0;
        if (includesGaji && includesTHR) {
          empAmount = Number(emp.salary) + Number(emp.allowance); // Fix: Gaji + THR means BOTH! User explicitly said `Gaji Bulanan` uses `salary`, `THR/Bonus` uses `allowance`. If both selected, we sum both.
        } else if (includesGaji) {
          empAmount = Number(emp.salary);
        } else if (includesTHR && !includesGaji) {
          empAmount = Number(emp.allowance);
        } else if (isLemburOnly) {
          empAmount = 0; // Handled by manual amount
        } else {
           // Default fallback
           empAmount = Number(emp.salary) + Number(emp.allowance);
        }
        return sum + empAmount;
      }
      return sum;
    }, 0);

    const manualValue = parseRupiah(manualAmount);
    // If lembur is included, add manual amount (multiplied by employees if per-emp)
    if (includesLembur) {
      rawTotal = employeeBaseSum + (manualValue * selectedIds.length);
    } else {
      rawTotal = employeeBaseSum;
    }

    setCalculatedTotal(rawTotal);

    // Validate if the selected account has enough balance
    const selectedAccount = cashAccounts.find(acc => acc.id === accountId);
    if (selectedAccount && Number(selectedAccount.balance) < rawTotal) {
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          icon: 'error',
          title: 'Saldo Tidak Mencukupi',
          text: `Saldo rekening ${selectedAccount.name} (${formatRupiah(selectedAccount.balance)}) tidak cukup untuk membayar total payroll sebesar ${formatRupiah(rawTotal)}.`,
          confirmButtonColor: 'var(--primary-color)'
        });
      });
      return;
    }

    setLoading(true);

    try {
      let proofUrl = null;

      // 1. Upload File (if provided)
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await uploadProofFile(formData);
        
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        proofUrl = uploadRes.url;
      }

      // 2. Save Payroll
      const res = await createPayroll({
        accountId,
        employeeIds: selectedIds,
        period,
        type: typeString,
        date: new Date(date),
        notes,
        proofUrl: proofUrl || undefined,
        manualAmount: includesLembur ? manualValue : undefined
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/payroll');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;

  const includesLemburUI = selectedTypes.includes('Lembur/Tambahan');

  return (
    <>
      <Topbar title="Buat Payroll" />
      <div className={styles.page}>
        <Link href="/payroll" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Payroll Baru</h2>
          <p className={styles.formSubtitle}>Pilih tipe, karyawan, dan total sebelum membuat pembayaran.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className="alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div className={styles.formGrid}>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label className="label">Tipe Payroll <span style={{color: '#ef4444'}}>*</span></label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {payrollTypes.map((t) => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedTypes.includes(t)} 
                        onChange={() => toggleType(t)} 
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {includesLemburUI && (
                <div className={styles.field}>
                  <label className="label">Total Bayar Manual (Lembur/Tambahan) per Karyawan <span style={{color: '#ef4444'}}>*</span></label>
                  <input 
                    type="text" 
                    className="input" 
                    value={manualAmount}
                    onChange={(e) => setManualAmount(formatRupiah(e.target.value))}
                    placeholder="Contoh: Rp 500.000"
                    required={includesLemburUI}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Jumlah ini akan ditambahkan ke setiap karyawan yang dipilih.
                  </span>
                </div>
              )}

              <div className={styles.field}>
                <label className="label">Rekening Sumber <span style={{color: '#ef4444'}}>*</span></label>
                <select className="select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Pilih rekening...</option>
                  {cashAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - {acc.bank}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Periode <span style={{color: '#ef4444'}}>*</span></label>
                <input type="month" className="input" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className="label">Tanggal Pembayaran <span style={{color: '#ef4444'}}>*</span></label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label className="label">Bukti Transfer (Opsional)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  id="proofFile"
                  className="input" 
                  style={{ display: 'none' }}
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                />
                <label htmlFor="proofFile" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', width: 'fit-content' }}>
                  <UploadCloud size={16} /> Pilih File
                </label>
                {file && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-color-strong)', width: 'fit-content' }}>
                     {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                     ) : (
                        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>📄 PDF</div>
                     )}
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{file.name}</span>
                       <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</span>
                     </div>
                     <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)', padding: '4px', marginLeft: '12px' }}>
                       <X size={16} />
                     </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className="label">Keterangan</label>
              <textarea className="input" rows={2} placeholder="Catatan payroll..." style={{ resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className={styles.field}>
              <div className={styles.teamHeader}>
                <label className="label">Pilih Karyawan ({selectedIds.length} dipilih) <span style={{color: '#ef4444'}}>*</span></label>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  Pilih Semua
                </label>
              </div>
              <div className={styles.teamSearchBox}>
                <Search size={14} className={styles.teamSearchIcon} />
                <input
                  type="text"
                  className={`input ${styles.teamSearchInput}`}
                  placeholder="Cari karyawan..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                />
              </div>
              <div className={styles.teamSelect}>
                {employees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Belum ada data karyawan aktif.</div>
                ) : filteredEmployees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Tidak ada karyawan yang cocok dengan pencarian.</div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <label key={emp.id} className={styles.teamOption}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                      />
                      <span className={styles.teamAvatar}>{emp.avatar || '👤'}</span>
                      <div className={styles.teamInfo}>
                        <span className={styles.teamName}>{emp.name}</span>
                        <span className={styles.teamRole}>{emp.position} — {emp.department?.name || 'Umum'}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <Link href="/payroll" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Memproses...' : 'Proses Payroll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
