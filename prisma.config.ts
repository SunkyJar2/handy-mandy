import 'dotenv/config';
import { definePrismaConfig } from 'prisma/config';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

function cleanUrl(raw?: string): string | null {
  if (!raw) return null;
  let url = raw.trim();
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
    } catch {}
  }
  return null;
}

const connection =
  cleanUrl(process.env.DATABASE_URL) ||
  cleanUrl(process.env.POSTGRES_PRISMA_URL) ||
  cleanUrl(process.env.POSTGRES_URL) ||
  'postgresql://postgres:postgres@localhost:5432/handymandy';

export default definePrismaConfig({
  orm: ormConfig({
    contract: './src/prisma/contract.prisma',
    db: {
      connection
    }
  })
});
