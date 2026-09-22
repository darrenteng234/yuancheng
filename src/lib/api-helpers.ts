import { NextResponse } from 'next/server';
import { NotFoundError, LimitError, ForbiddenError } from '@/lib/repos/db';

/** Map thrown domain errors to clean HTTP responses. Use in every route catch. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 });
  if (err instanceof ForbiddenError) return NextResponse.json({ error: err.message }, { status: 403 });
  if (err instanceof LimitError) return NextResponse.json({ error: err.message, code: 'limit_reached' }, { status: 409 });
  if (err instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const msg = err instanceof Error ? err.message : 'Internal server error';
  console.error('[api]', msg);
  return NextResponse.json({ error: msg }, { status: 500 });
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
