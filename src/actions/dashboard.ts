'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardData() {
  try {
    const kasCategories = ['Kas Kecil', 'Tabungan', 'Transfer Masuk', 'Transfer Keluar', 'Lainnya'];

    const [
      cashAccounts,
      pendingInvoices,
      totalIncomeResult,
      totalExpenseResult,
      activeProjects,
      kasTransactions,
      operationalTransactions,
      recentPayrolls,
      settingsRes
    ] = await Promise.all([
      prisma.cashAccount.findMany({
        select: { balance: true }
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['pending', 'partial', 'overdue'] }
        },
        select: { amount: true, paidAmount: true }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income' }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense' }
      }),
      prisma.project.findMany({
        where: {
          status: { in: ['planning', 'development', 'testing'] }
        },
        select: {
          id: true,
          name: true,
          client: true,
          status: true,
          progress: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      prisma.transaction.findMany({
        where: { category: { in: kasCategories } },
        select: { id: true, type: true, description: true, date: true, amount: true },
        orderBy: { date: 'desc' },
        take: 2,
      }),
      prisma.transaction.findMany({
        where: { category: { notIn: [...kasCategories, 'Gaji', 'Pembayaran Proyek'] } },
        select: { id: true, type: true, description: true, date: true, amount: true },
        orderBy: { date: 'desc' },
        take: 2,
      }),
      prisma.payroll.findMany({
        select: { id: true, type: true, period: true, date: true, totalAmount: true },
        orderBy: { date: 'desc' },
        take: 2,
      }),
      prisma.systemSetting.findUnique({ where: { id: 'singleton' } })
    ]);

    const totalCash = cashAccounts.reduce((sum: number, acc: { balance: any }) => sum + Number(acc.balance), 0);
    const pendingAmount = pendingInvoices.reduce(
      (sum: number, inv: { amount: any; paidAmount: any }) => sum + (Number(inv.amount) - Number(inv.paidAmount)),
      0
    );

    const totalIncome = Number(totalIncomeResult._sum.amount || 0);
    const totalExpense = Number(totalExpenseResult._sum.amount || 0);
    const estimatedProfit = totalIncome - totalExpense;
    const payrollDay = settingsRes?.payrollDay || 25;

    const mixedRecent = [
      ...kasTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
        amount: Number(t.amount)
      })),
      ...operationalTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
        amount: Number(t.amount)
      })),
      ...recentPayrolls.map((p: any) => ({
        id: p.id,
        type: 'expense',
        description: `Payroll: ${p.type} (${p.period})`,
        date: p.date.toISOString(),
        amount: Number(p.totalAmount)
      }))
    ];

    mixedRecent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalCash,
      pendingCount: pendingInvoices.length,
      pendingAmount,
      estimatedProfit,
      activeProjects,
      recentTransactions: mixedRecent,
      payrollDay
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}
