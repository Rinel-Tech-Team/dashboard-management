import Topbar from '@/components/Topbar';
import { getInvoiceById } from '@/actions/invoices';
import { getProjects } from '@/actions/projects';
import EditInvoiceWrapper from './EditInvoiceWrapper';
import { notFound } from 'next/navigation';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const invoice = await getInvoiceById(resolvedParams.id);
  
  if (!invoice) {
    notFound();
  }

  const projectsData = await getProjects();
  
  const activeProjects = projectsData
    .filter(p => p.status !== 'Canceled')
    .map(p => ({
      id: p.id,
      name: p.name,
      client: p.client
    }));

  return (
    <>
      <Topbar title="Edit Invoice" />
      <EditInvoiceWrapper initialData={invoice} projects={activeProjects} />
    </>
  );
}
