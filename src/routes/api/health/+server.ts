import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

/**
 * Deployment diagnostics. Returns coarse pass/fail checks only —
 * never the connection string or credentials.
 */
export const GET: RequestHandler = async () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';

  const checks: Record<string, unknown> = {
    envVarPresent: url.length > 0,
    validProtocol: /^postgres(ql)?:\/\//.test(url),
    connected: false,
    tablesExist: false,
    productCount: null as number | null
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.connected = true;
    checks.productCount = await db.product.count();
    checks.tablesExist = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    checks.errorHint = /does not exist|P2021|relation/i.test(msg)
      ? 'Tables missing: run `npm run db:push` against the cloud database.'
      : /Can't reach|ECONNREFUSED|ENOTFOUND|P1001|timed out/i.test(msg)
        ? 'Database host unreachable: check the host in your connection string.'
        : /authentication|password|P1000/i.test(msg)
          ? 'Authentication failed: check the user/password in your connection string.'
          : /query engine|binary|libquery/i.test(msg)
            ? 'Prisma engine not found for this runtime: redeploy without build cache.'
            : 'Unknown database error: check the Vercel function logs.';
  }

  const ok = checks.connected === true && checks.tablesExist === true;
  return json({ ok, ...checks }, { status: ok ? 200 : 503 });
};
