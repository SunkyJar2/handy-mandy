import { json, type RequestHandler } from '@sveltejs/kit';
import { db, getResolvedDatabaseUrl } from '$lib/server/db';

/**
 * Deployment diagnostics endpoint.
 * Returns operational status and connection diagnostics without exposing credentials.
 */
export const GET: RequestHandler = async () => {
  const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
  const hasPrismaUrl = Boolean(process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.trim().length > 0);
  const hasPostgresUrl = Boolean(process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim().length > 0);

  const envSource = hasDbUrl
    ? 'DATABASE_URL'
    : hasPrismaUrl
      ? 'POSTGRES_PRISMA_URL'
      : hasPostgresUrl
        ? 'POSTGRES_URL'
        : 'none';

  let sanitizedHost = 'unknown';
  let hasValidProtocol = false;

  try {
    const resolvedUrl = getResolvedDatabaseUrl();
    const u = new URL(resolvedUrl);
    sanitizedHost = u.host;
    hasValidProtocol = u.protocol === 'postgres:' || u.protocol === 'postgresql:';
  } catch {
    // ignore parse error
  }

  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    envVarConfigured: envSource !== 'none',
    envSource,
    databaseHost: sanitizedHost,
    validProtocol: hasValidProtocol,
    connected: false,
    tablesExist: false,
    productCount: null as number | null,
    errorHint: null as string | null
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
    if (!checks.envVarConfigured) {
      checks.errorHint =
        'DATABASE_URL is not set in Vercel environment variables. Go to Vercel Dashboard > Project Settings > Environment Variables, add DATABASE_URL (for Production and Preview), and redeploy.';
    } else if (/does not exist|relation/i.test(msg)) {
      checks.errorHint = 'Tables are missing in database: run `npx prisma db update` against this database.';
    } else if (/Can't reach|ECONNREFUSED|ENOTFOUND|timed out/i.test(msg)) {
      checks.errorHint = `Database host (${sanitizedHost}) is unreachable: verify firewall / allowlist or host configuration.`;
    } else if (/authentication|password/i.test(msg)) {
      checks.errorHint = 'Authentication failed: check user and password in DATABASE_URL.';
    } else {
      checks.errorHint = `Database error: ${msg.slice(0, 150)}`;
    }
  }

  const ok = checks.connected === true && checks.tablesExist === true;
  return json({ ok, ...checks }, { status: ok ? 200 : 503 });
};
