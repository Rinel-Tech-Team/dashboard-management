import { getDashboardData } from '@/actions/dashboard';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardContent data={data} />;
}
