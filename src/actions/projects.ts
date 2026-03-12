'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ProjectFormData {
  name: string;
  client: string;
  budget: number;
  startDate: string;
  deadline: string;
  description?: string;
  teamIds: string[];
  status?: string;
  progress?: number;
}

export async function getProjects() {
  const projects = await prisma.project.findMany({
    include: {
      teamMembers: {
        include: { employee: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    client: p.client,
    description: p.description || '',
    budget: Number(p.budget),
    spent: Number(p.spent),
    status: p.status,
    progress: p.progress,
    startDate: p.startDate.toISOString(),
    deadline: p.deadline.toISOString(),
    teamMembers: p.teamMembers.map((tm) => ({
      id: tm.employee.id,
      name: tm.employee.name,
      avatar: tm.employee.avatar || '',
      position: tm.employee.position,
      department: tm.employee.departmentId
    })),
    teamIds: p.teamMembers.map((tm) => tm.employee.id)
  }));
}

export async function getProjectById(id: string) {
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      teamMembers: {
        include: { employee: true }
      },
      invoices: true
    }
  });

  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    client: p.client,
    description: p.description || '',
    budget: Number(p.budget),
    spent: Number(p.spent),
    status: p.status,
    progress: p.progress,
    startDate: p.startDate.toISOString(),
    deadline: p.deadline.toISOString(),
    teamMembers: p.teamMembers.map((tm) => ({
      id: tm.employee.id,
      name: tm.employee.name,
      avatar: tm.employee.avatar || '',
      position: tm.employee.position,
      department: tm.employee.departmentId
    })),
    teamIds: p.teamMembers.map((tm) => tm.employee.id),
    invoices: p.invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: Number(inv.amount),
      status: inv.status,
      paidAmount: Number(inv.paidAmount)
    }))
  };
}

export async function createProject(data: ProjectFormData) {
  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        client: data.client,
        budget: data.budget,
        startDate: new Date(data.startDate),
        deadline: new Date(data.deadline),
        description: data.description,
        status: 'Requirement/Planning',
        progress: 0,
        teamMembers: {
          create: data.teamIds.map(id => ({
            employee: { connect: { id } }
          }))
        }
      }
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, id: project.id };
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
    console.error(err);
    return { error: 'Gagal membuat proyek' };
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  try {
    // Delete old relationships and create new ones
    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId: id } }),
      prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          client: data.client,
          budget: data.budget,
          startDate: new Date(data.startDate),
          deadline: new Date(data.deadline),
          description: data.description,
          status: data.status,
          progress: data.progress,
          teamMembers: {
            create: data.teamIds.map(empId => ({
              employee: { connect: { id: empId } }
            }))
          }
        }
      })
    ]);

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
    console.error(err);
    return { error: 'Gagal update proyek' };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return { error: 'Gagal menghapus! Proyek terkait dengan Transaksi / Tagihan.' };
    }
    console.error(err);
    return { error: 'Gagal menghapus proyek' };
  }
}

export async function updateProjectStatusProgress(id: string, status: string, progress: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { status, progress }
    });
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: 'Gagal update status' };
  }
}
