import 'temporal-polyfill/full/global';
import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const connection =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/handymandy';

const globalForPrisma = globalThis as unknown as {
  prisma8Db?: ReturnType<typeof postgres<Contract>>;
};

export const db =
  globalForPrisma.prisma8Db ??
  postgres<Contract>({
    contractJson,
    url: connection
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma8Db = db;
}
