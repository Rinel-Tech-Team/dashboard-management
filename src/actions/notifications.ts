'use server';

import { prisma } from '@/lib/prisma';

export async function getNotificationData() {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const [pendingPayrolls, urgentInvoices] = await Promise.all([
      prisma.payroll.findMany({
        where: { status: 'pending' },
        select: { id: true, period: true, type: true, employeeCount: true, date: true }
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['pending', 'partial', 'overdue'] },
          dueDate: { lte: threeDaysFromNow }
        },
        select: { id: true, number: true, dueDate: true, status: true, amount: true }
      })
    ]);

    const notifications = [
      ...pendingPayrolls.map(p => ({
        id: `payroll-${p.id}`,
        text: `Payroll ${p.period} (${p.type}) belum diproses (${p.employeeCount} orang)`,
        time: p.date.toISOString(),
        type: 'warning',
        category: 'payroll'
      })),
      ...urgentInvoices.map(inv => {
        const isOverdue = new Date(inv.dueDate) < today || inv.status === 'overdue';
        return {
          id: `invoice-${inv.id}`,
          text: `Invoice ${inv.number} ${isOverdue ? 'sudah overdue' : 'mendekati jatuh tempo'}`,
          time: inv.dueDate.toISOString(),
          type: isOverdue ? 'danger' : 'warning',
          category: 'invoice'
        };
      })
    ];

    // Sort by date (descending)
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notification data:', error);
    return { error: 'Gagal memuat notifikasi.' };
  }
}
