export async function POST(request) {
  const body = await request.json();
  const { value, category } = body;

  const processedValue = value.trim().toUpperCase();

  const result = {
    success: true,
    original: value,
    processed: processedValue,
    category: category,
    timestamp: new Date().toISOString(),
  };

  return Response.json(result);
}
