'use client';

import { useRouter } from 'next/navigation';
import InvoiceForm from '../../InvoiceForm';
import { updateInvoice, InvoiceFormData } from '@/actions/invoices';

interface EditInvoiceWrapperProps {
  initialData: any;
  projects: any[];
}

export default function EditInvoiceWrapper({ initialData, projects }: EditInvoiceWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: InvoiceFormData) => {
    const res = await updateInvoice(initialData.id, data);
    if (!res?.error) {
      router.push(`/invoices/${initialData.id}`);
      return {};
    }
    return res;
  };

  return <InvoiceForm initialData={initialData} projects={projects} onSubmit={handleSubmit} />;
}
