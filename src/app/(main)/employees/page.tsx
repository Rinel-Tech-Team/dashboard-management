import { getEmployees, getDepartments } from '@/actions/employees';
import Topbar from '@/components/Topbar';
import PageHeader from '@/components/PageHeader';
import EmployeesTable from './EmployeesTable';
import styles from './page.module.css';

export default async function EmployeesPage() {
  const [employees, departments] = await Promise.all([
    getEmployees(),
    getDepartments(),
  ]);

  return (
    <>
      <Topbar title="Karyawan" subtitle="Kelola data karyawan perusahaan" />
      <div className={styles.page}>
        <PageHeader
          title="Daftar Karyawan"
          subtitle={`Total ${employees.length} karyawan terdaftar`}
          actionLabel="Tambah Karyawan"
          actionHref="/employees/new"
        />
        <EmployeesTable employees={employees} departments={departments} />
      </div>
    </>
  );
}
