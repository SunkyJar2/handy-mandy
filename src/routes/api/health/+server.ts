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
    const pingQuery = db.raw.sql`SELECT 1 as ping`.returnsRow({ ping: 'pg/int4@1' }).build();
    await db.runtime().query(pingQuery);
    checks.connected = true;

    const agg = await db.orm.public.Product.aggregate((a) => ({ count: a.count() }));
    checks.productCount = Number(agg.count ?? 0);
    checks.tablesExist = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    checks.errorHint = /does not exist|relation/i.test(msg)
      ? 'Tables missing: run `npx prisma db update` against the cloud database.'
      : /Can't reach|ECONNREFUSED|ENOTFOUND|timed out/i.test(msg)
        ? 'Database host unreachable: check the host in your connection string.'
        : /authentication|password/i.test(msg)
          ? 'Authentication failed: check the user/password in your connection string.'
          : 'Unknown database error: check the Vercel function logs.';
  }

  const ok = checks.connected === true && checks.tablesExist === true;
  return json({ ok, ...checks }, { status: ok ? 200 : 503 });
};
