'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface InvoiceFormData {
  projectId: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  description?: string;
  number?: string;
}

function calculateStatus(amount: number, paidAmount: number, dueDate: Date): string {
  if (paidAmount >= amount && amount > 0) return 'paid';
  if (paidAmount > 0) return 'partial';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (today > due) return 'overdue';
  return 'pending';
}

export async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      project: { select: { name: true, client: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    projectId: inv.projectId,
    projectName: inv.project.name,
    clientName: inv.project.client,
    amount: Number(inv.amount),
    paidAmount: Number(inv.paidAmount),
    // Dynamically calculate status on fetch to ensure overdue is up-to-date
    status: calculateStatus(Number(inv.amount), Number(inv.paidAmount), inv.dueDate),
    issuedDate: inv.issuedDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    description: inv.description || '',
  }));
}

export async function getInvoiceById(id: string) {
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: {
      project: { select: { name: true, client: true, startDate: true, deadline: true } },
      transactions: {
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!inv) return null;

  return {
    id: inv.id,
    number: inv.number,
    projectId: inv.projectId,
    projectName: inv.project.name,
    clientName: inv.project.client,
    projectStartDate: inv.project.startDate.toISOString(),
    projectDeadline: inv.project.deadline.toISOString(),
    amount: Number(inv.amount),
    paidAmount: Number(inv.paidAmount),
    status: calculateStatus(Number(inv.amount), Number(inv.paidAmount), inv.dueDate),
    issuedDate: inv.issuedDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    description: inv.description || '',
    transactions: inv.transactions.map(t => ({
      id: t.id,
      date: t.date.toISOString(),
      description: t.description,
      amount: Number(t.amount)
    }))
  };
}

export async function createInvoice(data: InvoiceFormData) {
  try {
    const dueDate = new Date(data.dueDate);
    const generatedNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Status is dynamically calculated but initially saved as determined by date/amount
    const status = calculateStatus(data.amount, 0, dueDate);

    const inv = await prisma.invoice.create({
      data: {
        number: data.number || generatedNumber,
        projectId: data.projectId,
        amount: data.amount,
        paidAmount: 0,
        status,
        issuedDate: new Date(data.issuedDate),
        dueDate,
        description: data.description,
      }
    });

    revalidatePath('/invoices');
    return { success: true, id: inv.id };
  } catch (err: any) {
    console.error(err);
    return { error: 'Gagal membuat invoice' };
  }
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
  try {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return { error: 'Invoice tidak ditemukan' };

    const dueDate = new Date(data.dueDate);
    const status = calculateStatus(data.amount, Number(existing.paidAmount), dueDate);

    await prisma.invoice.update({
      where: { id },
      data: {
        projectId: data.projectId,
        amount: data.amount,
        status,
        issuedDate: new Date(data.issuedDate),
        dueDate,
        description: data.description,
      }
    });

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: 'Gagal update invoice' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/invoices');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: 'Gagal menghapus invoice' };
  }
}
