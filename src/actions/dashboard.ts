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
      settingsRes,
      activeEmployeesRes,
      lastMonthIncomeResult,
      lastMonthExpenseResult,
      lastMonthPayrollResult,
      recentPayrolls,
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
      prisma.systemSetting.findUnique({ where: { id: 'singleton' } }),
      prisma.employee.findMany({
        where: { status: 'active' },
        select: { id: true, salary: true, allowance: true }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'income',
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'expense',
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.payroll.aggregate({
        _sum: { totalAmount: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.payroll.findMany({
        select: { id: true, type: true, period: true, date: true, totalAmount: true },
        orderBy: { date: 'desc' },
        take: 2,
      }),
    ]);

    const totalCash = cashAccounts.reduce((sum: number, acc: { balance: any }) => sum + Number(acc.balance), 0);
    
    // Calculate last month net to determine growth
    const lmIncome = Number(lastMonthIncomeResult._sum.amount || 0);
    const lmExpenseTrx = Number(lastMonthExpenseResult._sum.amount || 0);
    const lmExpensePayroll = Number(lastMonthPayrollResult._sum.totalAmount || 0);
    const lmNet = lmIncome - (lmExpenseTrx + lmExpensePayroll);
    
    const prevCash = totalCash - lmNet;
    const cashGrowth = prevCash > 0 ? ((totalCash - prevCash) / prevCash) * 100 : 0;
    
    const activeEmployees = activeEmployeesRes.length;
    const totalMonthlySalary = activeEmployeesRes.reduce((sum: number, emp: any) => sum + Number(emp.salary) + Number(emp.allowance), 0);

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

    // Generate Chart Data for the last 12 months
    const chartData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Get start date (12 months ago from today)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all transactions and payrolls for the last 12 months
    const [allTransactions, allPayrolls] = await Promise.all([
      prisma.transaction.findMany({
        where: { date: { gte: startDate } },
        select: { type: true, amount: true, date: true }
      }),
      prisma.payroll.findMany({
        where: { date: { gte: startDate } },
        select: { totalAmount: true, date: true }
      })
    ]);

    // Aggregate by month
    for (let i = 0; i < 12; i++) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + i);
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();
        const monthYear = `${monthName} ${year.toString().slice(-2)}`;
        
        const monthStart = new Date(year, d.getMonth(), 1);
        const monthEnd = new Date(year, d.getMonth() + 1, 0, 23, 59, 59);

        const monthTransactions = allTransactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
        const monthPayrolls = allPayrolls.filter(p => p.date >= monthStart && p.date <= monthEnd);

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenseFromTrx = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenseFromPayroll = monthPayrolls
            .reduce((sum, p) => sum + Number(p.totalAmount), 0);

        chartData.push({
            month: monthYear,
            income,
            expense: expenseFromTrx + expenseFromPayroll
        });
    }

    return {
      totalCash,
      pendingCount: pendingInvoices.length,
      pendingAmount,
      estimatedProfit,
      activeProjects,
      recentTransactions: mixedRecent,
      payrollDay,
      chartData,
      cashGrowth,
      activeEmployees,
      totalMonthlySalary
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}
