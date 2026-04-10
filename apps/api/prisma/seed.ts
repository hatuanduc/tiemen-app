import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@tiemen.local';
  const password = process.env.DEMO_PASSWORD ?? 'admin123';
  const hashed = bcrypt.hashSync(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Seed user already exists:', email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      password: hashed,
    },
  });

  console.log('Created seed user:', user.email);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
