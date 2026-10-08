import 'temporal-polyfill/full/global';
import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

function cleanUrl(raw?: string): string | null {
  if (!raw) return null;
  let url = raw.trim();
  // Strip wrapping double or single quotes if copied with quotes
  while ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:') {
      return url;
    }
  } catch {
    try {
      const match = url.match(/^(postgres(?:ql)?:\/\/)([^:]+):([^@]+)@(.+)$/);
      if (match) {
        const [, proto, user, pass, rest] = match;
        const encodedPass = encodeURIComponent(decodeURIComponent(pass));
        const repaired = `${proto}${encodeURIComponent(decodeURIComponent(user))}:${encodedPass}@${rest}`;
        const check = new URL(repaired);
        if (check.protocol === 'postgres:' || check.protocol === 'postgresql:') {
          return repaired;
        }
      }
    } catch {
      // cannot repair
    }
  }
  return null;
}

export function getResolvedDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    'postgresql://postgres:postgres@localhost:5432/handymandy'
  ];

  for (const c of candidates) {
    const cleaned = cleanUrl(c);
    if (cleaned) return cleaned;
  }

  return 'postgresql://postgres:postgres@localhost:5432/handymandy';
}

const globalForPrisma = globalThis as unknown as {
  prisma8Db?: ReturnType<typeof postgres<Contract>>;
};

function getOrCreateClient(): ReturnType<typeof postgres<Contract>> {
  if (!globalForPrisma.prisma8Db) {
    const url = getResolvedDatabaseUrl();
    globalForPrisma.prisma8Db = postgres<Contract>({
      contractJson,
      url
    });
  }
  return globalForPrisma.prisma8Db;
}

// Lazy proxy: ensures importing db at build time (e.g. during Vite/SvelteKit server bundle analysis)
// does not trigger postgres client initialization before runtime environment variables are evaluated.
export const db = new Proxy({} as ReturnType<typeof postgres<Contract>>, {
  get(_target, prop, receiver) {
    const client = getOrCreateClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
