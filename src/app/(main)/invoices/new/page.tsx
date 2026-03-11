import Topbar from '@/components/Topbar';
import { getProjects } from '@/actions/projects';
import InvoiceFormWrapper from './InvoiceFormWrapper';

export default async function NewInvoicePage() {
  const projectsData = await getProjects();
  
  // Filter and map to basic project options
  const activeProjects = projectsData
    .filter(p => p.status !== 'Canceled')
    .map(p => ({
      id: p.id,
      name: p.name,
      client: p.client
    }));

  return (
    <>
      <Topbar title="Buat Invoice" />
      <InvoiceFormWrapper projects={activeProjects} />
    </>
  );
}
