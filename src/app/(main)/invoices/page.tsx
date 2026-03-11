import Topbar from '@/components/Topbar';
import { getInvoices } from '@/actions/invoices';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <>
      <Topbar title="Invoice" subtitle="Kelola semua invoice proyek" />
      <InvoicesClient initialData={invoices} />
    </>
  );
}
