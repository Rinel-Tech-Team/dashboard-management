import { PrismaClient } from '@prisma/client';
import {
  employees,
  projects,
  invoices,
  transactions,
  cashAccounts,
} from '../lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.payrollDetail.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.cashAccount.deleteMany();

  // 2. Seed Departments
  const deptNames = Array.from(new Set(employees.map(e => e.department)));
  const deptMap = new Map();
  for (const name of deptNames) {
    const dept = await prisma.department.create({
      data: { name, description: `Department ${name}` },
    });
    deptMap.set(name, dept.id);
  }

  // 3. Seed Cash Accounts
  const accountMap = new Map();
  for (const acc of cashAccounts) {
    const createdAcc = await prisma.cashAccount.create({
      data: {
        id: acc.id,
        name: acc.name,
        bank: acc.bank,
        balance: acc.balance,
        icon: acc.icon,
      },
    });
    accountMap.set(acc.id, createdAcc.id);
  }

  // 4. Seed Employees
  const empMap = new Map();
  for (const emp of employees) {
    const createdEmp = await prisma.employee.create({
      data: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        avatar: emp.avatar,
        position: emp.position,
        status: emp.status,
        joinDate: new Date(emp.joinDate),
        salary: emp.salary,
        allowance: emp.allowance,
        departmentId: deptMap.get(emp.department),
      },
    });
    empMap.set(emp.id, createdEmp.id);
  }

  // 5. Seed Projects and Project Members
  const projMap = new Map();
  for (const proj of projects) {
    const createdProj = await prisma.project.create({
      data: {
        id: proj.id,
        name: proj.name,
        client: proj.client,
        description: proj.description,
        budget: proj.budget,
        spent: proj.spent,
        status: proj.status,
        progress: proj.progress,
        startDate: new Date(proj.startDate),
        deadline: new Date(proj.deadline),
      },
    });
    projMap.set(proj.id, createdProj.id);

    for (const teamId of proj.teamIds) {
      if (empMap.has(teamId)) {
        await prisma.projectMember.create({
          data: {
            projectId: createdProj.id,
            employeeId: teamId,
          },
        });
      }
    }
  }

  // 6. Seed Invoices
  const invMap = new Map();
  for (const inv of invoices) {
    const createdInv = await prisma.invoice.create({
      data: {
        id: inv.id,
        number: inv.number,
        amount: inv.amount,
        paidAmount: inv.paidAmount,
        status: inv.status,
        issuedDate: new Date(inv.issuedDate),
        dueDate: new Date(inv.dueDate),
        description: inv.description,
        projectId: projMap.get(inv.projectId),
      },
    });
    invMap.set(inv.id, createdInv.id);
  }

  // 7. Seed Transactions
  for (const trx of transactions) {
    // Determine invoice link for "Pembayaran Proyek"
    let invoiceId = null;
    if (trx.category === 'Pembayaran Proyek') {
      const match = trx.description.match(/INV-\d{4}-\d{3}/);
      if (match) {
        const invStr = match[0];
        const linkedInv = invoices.find(i => i.number === invStr);
        if (linkedInv) {
          invoiceId = linkedInv.id;
        }
      }
    }

    await prisma.transaction.create({
      data: {
        id: trx.id,
        date: new Date(trx.date),
        description: trx.description,
        category: trx.category,
        type: trx.type,
        amount: trx.amount,
        accountId: trx.accountId,
        invoiceId: invoiceId,
      },
    });
  }

  // 8. Create a Dummy Admin User Role
  // Wait, User / Role isn't in Schema yet. I'll add that later when setting up Supabase Auth.
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
