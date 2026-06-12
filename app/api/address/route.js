const USE_MOCK = process.env.USE_MOCK === "true";
const MYBRING_API_UID = process.env.MYBRING_API_UID;
const MYBRING_API_KEY = process.env.MYBRING_API_KEY;
const ADDRESS_BASE = "https://api.bring.com/address/api";

function buildMockAddresses(q) {
  const query = q.toLowerCase();
  const candidates = [
    { address_id: "MOCK-1", street_name: "Storgata", house_number: "1", letter: "", postal_code: "0155", city: "Oslo" },
    { address_id: "MOCK-2", street_name: "Storgata", house_number: "2", letter: "A", postal_code: "0155", city: "Oslo" },
  ];
  const filtered = candidates.filter((a) => a.street_name.toLowerCase().includes(query));
  return { addresses: filtered.length ? filtered : candidates };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 10);
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!q || q.trim().length < 2) {
    return Response.json({ addresses: [] });
  }

  try {
    const url = `${ADDRESS_BASE}/no/addresses/suggestions?q=${encodeURIComponent(q.trim())}&limit=${limit}&page=${page}`;
    const res = await fetch(url, {
      headers: {
        "X-Mybring-API-Uid": MYBRING_API_UID || "",
        "X-Mybring-API-Key": MYBRING_API_KEY || "",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("Bring Address API error:", res.status);
      if (USE_MOCK) {
        return Response.json(buildMockAddresses(q));
      }
      const err = await res.text();
      console.error("Bring Address API error body:", res.status, err);
      return Response.json({ error: "Kunne ikke hente adresseforslag." }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Address API fetch error:", error.message);
    if (USE_MOCK) {
      return Response.json(buildMockAddresses(q));
    }
    return Response.json(
      { error: "Kunne ikke kontakte adresseserver." },
      { status: 502 }
    );
  }
}
