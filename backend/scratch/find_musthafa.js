const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findMusthafa() {
  const customers = await prisma.customer.findMany({
    where: { name: { contains: 'Must' } }
  });

  console.log('Found customers:', customers.map(c => ({ name: c.name, id: c.id })));
}

findMusthafa()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
