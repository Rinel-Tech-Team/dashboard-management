'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface DepartmentFormData {
  name: string;
  description?: string;
  head?: string;
}

export async function getDepartments(search?: string) {
  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || '',
      head: dept.head || '-',
      employeeCount: dept._count.employees
    }));
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw new Error('Failed to fetch departments');
  }
}

export async function createDepartment(data: DepartmentFormData) {
  try {
    await prisma.department.create({
      data: {
        name: data.name,
        description: data.description || null,
        head: data.head || '-',
      }
    });

    revalidatePath('/departments');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create department:', error);
    return { error: 'Gagal menambahkan departemen. Silakan coba lagi.' };
  }
}

export async function updateDepartment(id: string, data: DepartmentFormData) {
  try {
    await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        head: data.head || '-',
      }
    });

    revalidatePath('/departments');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update department:', error);
    return { error: 'Gagal mengupdate departemen. Silakan coba lagi.' };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.delete({
      where: { id }
    });

    revalidatePath('/departments');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return { error: 'Departemen tidak bisa dihapus karena masih memiliki karyawan. Pindahkan atau hapus karyawan terlebih dahulu.' };
    }
    console.error('Failed to delete department:', error);
    return { error: 'Gagal menghapus departemen. Silakan coba lagi.' };
  }
}
