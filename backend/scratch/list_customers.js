const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listCustomers() {
  const customers = await prisma.customer.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  console.log('Last 20 customers:', customers.map(c => ({ name: c.name, id: c.id })));
}

listCustomers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
