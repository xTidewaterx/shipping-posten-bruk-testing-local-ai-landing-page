const USE_MOCK = process.env.USE_MOCK === "true";
const MYBRING_API_UID = process.env.MYBRING_API_UID;
const MYBRING_API_KEY = process.env.MYBRING_API_KEY;
const PICKUP_BASE = "https://api.bring.com/pickuppoint/api";

function buildMockPickupPoints(postalCode) {
  const base = {
    id: "MOCK-PP-001",
    name: "MOCK Pakkeboks",
    address: "MOCK Gate 1",
    postalCode: postalCode || "0000",
    city: "Oslo",
    distanceInKm: 0.5,
    durationInMinutes: 2,
    pickupPointType: "LOCKER",
    openingHours: [
      { day: "Man - Fre", opening: "00:00", closing: "23:59" },
    ],
    locationDescription: "På gulvet ved inngangen",
    coordinates: { lng: 10.7522, lat: 59.9139 },
  };
  const base2 = {
    id: "MOCK-PP-002",
    name: "MOCK Butikk",
    address: "MOCK Gate 2",
    postalCode: postalCode || "0000",
    city: "Oslo",
    distanceInKm: 1.2,
    durationInMinutes: 4,
    pickupPointType: "MANNED",
    openingHours: [
      { day: "Man - Fre", opening: "09:00", closing: "17:00" },
      { day: "Lør", opening: "10:00", closing: "14:00" },
    ],
    locationDescription: "Ved kassene",
    coordinates: { lng: 10.7585, lat: 59.9112 },
  };
  return [base, base2];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postalCode = searchParams.get("postalCode");
  const countryCode = searchParams.get("countryCode") || "NO";
  const requestCountryCode = searchParams.get("requestCountryCode");
  const street = searchParams.get("street");
  const streetNumber = searchParams.get("streetNumber");

  if (!postalCode) {
    return Response.json({ error: "postalCode er påkrevd." }, { status: 400 });
  }

  if (USE_MOCK) {
    return Response.json({ pickupPoints: buildMockPickupPoints(postalCode) });
  }

  try {
    let url = `${PICKUP_BASE}/pickuppoint/${encodeURIComponent(countryCode)}/postalCode/${encodeURIComponent(postalCode)}`;
    const params = [];
    if (requestCountryCode) params.push(`requestCountryCode=${encodeURIComponent(requestCountryCode)}`);
    if (street) params.push(`street=${encodeURIComponent(street)}`);
    if (streetNumber) params.push(`streetNumber=${encodeURIComponent(streetNumber)}`);
    if (params.length) url += "?" + params.join("&");

    const headRes = await fetch(url, {
      method: "HEAD",
      headers: {
        "X-Mybring-API-Uid": MYBRING_API_UID || "",
        "X-Mybring-API-Key": MYBRING_API_KEY || "",
        Accept: "application/json",
      },
    });

    if (!headRes.ok) {
      console.error("Bring Pickup Point API auth check failed:", headRes.status);
      const err = await headRes.text();
      console.error("Bring Pickup Point API error:", headRes.status, err);
      return Response.json({ error: "Kunne ikke hente hentesteder." }, { status: headRes.status });
    }

    const res = await fetch(url, {
      headers: {
        "X-Mybring-API-Uid": MYBRING_API_UID || "",
        "X-Mybring-API-Key": MYBRING_API_KEY || "",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Bring Pickup Point API error:", res.status, err);
      return Response.json({ error: "Kunne ikke hente hentesteder." }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Pickup Point API fetch error:", error.message);
    return Response.json(
      { error: "Kunne ikke kontakte hentested-server." },
      { status: 502 }
    );
  }
}
