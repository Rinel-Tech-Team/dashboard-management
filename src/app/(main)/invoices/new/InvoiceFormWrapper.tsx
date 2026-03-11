'use client';

import { useRouter } from 'next/navigation';
import InvoiceForm from '../InvoiceForm';
import { createInvoice, InvoiceFormData } from '@/actions/invoices';

interface InvoiceFormWrapperProps {
  projects: any[];
}

export default function InvoiceFormWrapper({ projects }: InvoiceFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: InvoiceFormData) => {
    const res = await createInvoice(data);
    if (!res?.error) {
      router.push(`/invoices/${res.id}`);
      return {};
    }
    return res;
  };

  return <InvoiceForm projects={projects} onSubmit={handleSubmit} />;
}
