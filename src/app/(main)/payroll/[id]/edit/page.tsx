'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Search, AlertCircle, UploadCloud, X } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { payrollTypes } from '@/lib/mockData';
import { uploadProofFile } from '@/actions/upload';
import { getPayrollById, updatePayroll } from '@/actions/payroll';
import { getEmployees } from '@/actions/employees';
import { getCashAccounts } from '@/actions/cash';
import styles from '../../new/page.module.css';

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

export default function EditPayrollPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [employees, setEmployees] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  // Form states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [accountId, setAccountId] = useState('');
  const [period, setPeriod] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingProof, setExistingProof] = useState<string | null>(null);

  // Employee Selection states
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, accRes, payrollRes] = await Promise.all([
          getEmployees(),
          getCashAccounts(),
          getPayrollById(id)
        ]);

        if (empRes && Array.isArray(empRes)) {
          setEmployees(empRes.filter((e: any) => e.status === 'active'));
        }
        if (accRes.success && accRes.accounts) {
          setCashAccounts(accRes.accounts);
        }

        if (payrollRes.success && payrollRes.payroll) {
          const p = payrollRes.payroll;
          // Parse string into array: "Gaji Bulanan, THR/Bonus" -> ["Gaji Bulanan", "THR/Bonus"]
          const parsedTypes = p.type ? p.type.split(',').map((t: string) => t.trim()) : [];
          setSelectedTypes(parsedTypes.length > 0 ? parsedTypes : [payrollTypes[0]]);
          setAccountId(p.accountId);
          setPeriod(p.period);
          setDate(new Date(p.date).toISOString().split('T')[0]);
          setNotes(p.notes || '');
          
          if (p.proofUrl) {
            setExistingProof(p.proofUrl);
          }

          // Set selected employees
          const selected = p.details.map((d: any) => d.employeeId);
          setSelectedIds(selected);
        } else {
          setError('Gagal memuat data payroll atau data tidak ditemukan.');
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

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

  const toggleEmployee = (empId: string) => {
    const isCurrentlySelected = selectedIds.includes(empId);
    let newSelected: string[];
    
    if (isCurrentlySelected) {
      newSelected = selectedIds.filter((x) => x !== empId);
    } else {
      newSelected = [...selectedIds, empId];
    }
    
    setSelectedIds(newSelected);
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
      setExistingProof(null); // Clear existing if any
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
    setExistingProof(null);
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
          empAmount = Number(emp.salary) + Number(emp.allowance); // Fix Gaji + THR = both
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
      let finalProofUrl = existingProof || undefined;

      // Upload new file if provided
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await uploadProofFile(formData);
        
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        finalProofUrl = uploadRes.url;
      }

      const res = await updatePayroll(id, {
        accountId,
        employeeIds: selectedIds,
        period,
        type: typeString,
        date: new Date(date),
        notes,
        proofUrl: finalProofUrl,
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
      <Topbar title="Edit Payroll" />
      <div className={styles.page}>
        <Link href="/payroll" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Edit Payroll</h2>
          <p className={styles.formSubtitle}>Ubah data untuk pembayaran ini.</p>

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
                <select 
                  className="select" 
                  value={accountId} 
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled
                  style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', opacity: 0.7 }}
                >
                  <option value="">Pilih rekening...</option>
                  {cashAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - {acc.bank}</option>
                  ))}
                </select>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Rekening sumber tidak dapat diubah setelah payroll dibuat.
                </span>
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
              <label className="label">Bukti Transfer</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  id="proofFile"
                  className="input" 
                  style={{ display: 'none' }}
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                />
                
                {/* Active Upload / Existing Proof View */}
                {(file || existingProof) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
                     {imagePreview || existingProof ? (
                        <img src={imagePreview || existingProof!} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                     ) : (
                        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>📄 File</div>
                     )}
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{file ? file.name : 'Bukti Tersimpan'}</span>
                     </div>
                     <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)', padding: '4px', marginLeft: '12px' }}>
                       <X size={16} />
                     </button>
                  </div>
                ) : (
                  <label htmlFor="proofFile" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', border: '1px dashed var(--border-color-strong)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', width: 'fit-content' }}>
                    <UploadCloud size={16} /> Pilih File Pengganti
                  </label>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className="label">Keterangan</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className={styles.field}>
              <div className={styles.teamHeader}>
                <label className="label">Pilih Karyawan ({selectedIds.length} dipilih) <span style={{color: '#ef4444'}}>*</span></label>
                <label className={styles.selectAllLabel}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
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
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data karyawan.</div>
                ) : filteredEmployees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Pencarian tidak ditemukan.</div>
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
                        <span className={styles.teamRole}>{emp.position}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <Link href="/payroll" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
