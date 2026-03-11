const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const payrolls = await prisma.payroll.findMany({ include: { details: { include: { employee: true } } } });
  console.log(JSON.stringify(payrolls, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
