import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!rawPassword) throw new Error("SEED_ADMIN_PASSWORD env var is required");

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  await prisma.user.upsert({
    where: { email: "peter@restorative.dev" },
    update: {},
    create: {
      email: "peter@restorative.dev",
      passwordHash,
      fullName: "Peter",
      accountType: "Founder",
      isAdmin: true,
    },
  });

  console.log("Seeded admin user: peter@restorative.dev");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
