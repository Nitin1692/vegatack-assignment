export function isEmail(s: string) { return /@/.test(s); }
export function badRequest(msg: string) { return Response.json({ error: msg }, { status: 400 }); }
export function paginate(searchParams: URLSearchParams) {
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const cursor = searchParams.get('cursor');
  return { limit, cursor };
}