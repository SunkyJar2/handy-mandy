import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Support DATABASE_URL, or Vercel Postgres / Neon automatic env vars (POSTGRES_PRISMA_URL, POSTGRES_URL)
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(connectionString ? { datasources: { db: { url: connectionString } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
