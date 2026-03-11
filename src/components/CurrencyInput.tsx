'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './CurrencyInput.module.css';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

function formatToRupiah(num: number): string {
  if (num === 0) return '';
  return num.toLocaleString('id-ID');
}

function parseFromRupiah(str: string): number {
  const cleaned = str.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  required = false,
  id,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatToRupiah(value));

  useEffect(() => {
    setDisplayValue(formatToRupiah(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const numericValue = parseFromRupiah(raw);
      setDisplayValue(formatToRupiah(numericValue));
      onChange(numericValue);
    },
    [onChange]
  );

  return (
    <div className={styles.wrapper}>
      <span className={styles.prefix}>Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className={`input ${styles.input}`}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
    </div>
  );
}
