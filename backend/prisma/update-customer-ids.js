const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting customerId update based on loan frequency...');

  // Fetch all customers with their loans
  const customers = await prisma.customer.findMany({
    include: {
      loans: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  for (const customer of customers) {
    if (customer.loans.length > 0) {
      const primaryLoan = customer.loans[0];
      if (primaryLoan.loanNumber) {
        try {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { customerId: primaryLoan.loanNumber }
          });
          console.log(`✅ Updated ${customer.name}'s customerId to ${primaryLoan.loanNumber}`);
        } catch (e) {
          console.error(`❌ Failed to update ${customer.name}: ${e.message}`);
        }
      } else {
        console.log(`⚠️ No loanNumber found for ${customer.name}'s primary loan. Skipping.`);
      }
    } else {
      console.log(`⚠️ Customer ${customer.name} has no loans. Skipping.`);
    }
  }

  console.log('🎉 Done updating customer IDs!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
