export async function GET() {
  const key = process.env.MYBRING_API_KEY;   
 
  if (!key || key.trim() === "") {
    return Response.json({ ok: false });
  }

  return Response.json({ ok: true });
}
