// Non-personal, server-local liveness endpoint for Docker orchestration.
// Does not call the public API or leak version, settings, database or tokens.
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    { status: 'ok' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
