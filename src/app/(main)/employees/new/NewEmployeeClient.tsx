'use client';

import EmployeeForm, { type EmployeeFormValues } from '@/components/EmployeeForm';
import { createEmployee } from '@/actions/employees';

interface Props {
  departments: { id: string; name: string }[];
}

export default function NewEmployeeClient({ departments }: Props) {
  const handleSubmit = async (values: EmployeeFormValues) => {
    const result = await createEmployee({
      name: values.name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      departmentId: values.departmentId,
      joinDate: values.joinDate,
      salary: values.salary,
      allowance: values.allowance || undefined,
      status: values.status,
    });
    return result;
  };

  return (
    <EmployeeForm
      topbarTitle="Tambah Karyawan"
      title="Data Karyawan Baru"
      departments={departments}
      onSubmit={handleSubmit}
      submitLabel="Simpan Karyawan"
    />
  );
}
