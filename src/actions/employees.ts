'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
  joinDate: string;
  salary: number;
  allowance?: number;
  status?: string;
}

export async function getEmployees(search?: string, departmentId?: string, status?: string) {
  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      avatar: emp.avatar || emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      position: emp.position,
      status: emp.status,
      department: emp.department.name,
      departmentId: emp.departmentId,
      joinDate: emp.joinDate.toISOString(),
      salary: Number(emp.salary),
      allowance: Number(emp.allowance),
      createdAt: emp.createdAt.toISOString(),
      updatedAt: emp.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    throw new Error('Failed to fetch employees');
  }
}

export async function getEmployeeById(id: string) {
  try {
    const emp = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        projectMembers: {
          include: {
            project: {
              select: { id: true, name: true, client: true, status: true, progress: true }
            }
          }
        }
      }
    });

    if (!emp) return null;

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      avatar: emp.avatar || emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      position: emp.position,
      status: emp.status,
      department: emp.department.name,
      departmentId: emp.departmentId,
      joinDate: emp.joinDate.toISOString(),
      salary: Number(emp.salary),
      allowance: Number(emp.allowance),
      createdAt: emp.createdAt.toISOString(),
      updatedAt: emp.updatedAt.toISOString(),
      projects: emp.projectMembers.map(pm => ({
        id: pm.project.id,
        name: pm.project.name,
        client: pm.project.client,
        status: pm.project.status,
        progress: pm.project.progress,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    throw new Error('Failed to fetch employee');
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return departments;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw new Error('Failed to fetch departments');
  }
}

export async function createEmployee(data: EmployeeFormData) {
  try {
    // Generate avatar from name initials
    const avatar = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatar,
        position: data.position,
        departmentId: data.departmentId,
        joinDate: new Date(data.joinDate),
        salary: data.salary,
        allowance: data.allowance || 0,
        status: data.status || 'active',
      }
    });

    revalidatePath('/employees');
    revalidatePath('/dashboard');
    revalidatePath('/projects/new');
    revalidatePath('/projects/[id]/edit', 'page');
    redirect('/employees');
  } catch (error: any) {
    // redirect throws NEXT_REDIRECT which we need to re-throw
    if (error?.message === 'NEXT_REDIRECT') throw error;

    if (error?.code === 'P2002') {
      return { error: 'Email sudah terdaftar. Gunakan email lain.' };
    }

    console.error('Failed to create employee:', error);
    return { error: 'Gagal menambahkan karyawan. Silakan coba lagi.' };
  }
}

export async function updateEmployee(id: string, data: EmployeeFormData) {
  try {
    const avatar = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatar,
        position: data.position,
        departmentId: data.departmentId,
        joinDate: new Date(data.joinDate),
        salary: data.salary,
        allowance: data.allowance || 0,
        status: data.status || 'active',
      }
    });

    revalidatePath('/employees');
    revalidatePath(`/employees/${id}`);
    revalidatePath('/dashboard');
    revalidatePath('/projects/new');
    revalidatePath('/projects/[id]/edit', 'page');
    redirect(`/employees/${id}`);
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') throw error;

    if (error?.code === 'P2002') {
      return { error: 'Email sudah digunakan karyawan lain.' };
    }

    console.error('Failed to update employee:', error);
    return { error: 'Gagal mengupdate karyawan. Silakan coba lagi.' };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({
      where: { id }
    });

    revalidatePath('/employees');
    revalidatePath('/dashboard');
    revalidatePath('/projects/new');
    revalidatePath('/projects/[id]/edit', 'page');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return { error: 'Karyawan tidak bisa dihapus karena terkait dengan data lain (payroll, proyek, dll).' };
    }

    console.error('Failed to delete employee:', error);
    return { error: 'Gagal menghapus karyawan. Silakan coba lagi.' };
  }
}

export async function getEmployeeCount() {
  try {
    const count = await prisma.employee.count();
    return count;
  } catch {
    return 0;
  }
}
