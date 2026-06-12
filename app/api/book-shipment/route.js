const USE_MOCK = process.env.USE_MOCK === "true";
const MYBRING_API_UID = process.env.MYBRING_API_UID;
const MYBRING_API_KEY = process.env.MYBRING_API_KEY;
const BRING_CLIENT_URL = process.env.BRING_CLIENT_URL;
const BRING_BOOKING_URL = "https://api.qa.bring.com/booking/api/create";

function buildMockResponse(body) {
  const correlationId =
    body.consignments?.[0]?.correlationId ||
    "INTERNAL-" + Math.floor(Math.random() * 1000000);
  const packageCorrelationId =
    body.consignments?.[0]?.packages?.[0]?.correlationId ||
    "PACKAGE-" + Math.floor(Math.random() * 1000000);
  const consignmentNumber = "7072215227" + Math.floor(Math.random() * 100000000);
  const packageNumber = "LL" + Math.floor(Math.random() * 1000000000) + "NO";

  return {
    consignments: [
      {
        correlationId,
        confirmation: {
          consignmentNumber,
          productSpecificData: null,
          links: {
            labels: null,
            waybill: null,
            tracking: `https://sporing.posten.no/sporing/${consignmentNumber}`,
          },
          dateAndTimes: {
            earliestPickup: Date.now() + 86400000,
            expectedDelivery: Date.now() + 3 * 86400000,
          },
          packages: [
              {
                weightInKg: 1.1,
                goodsDescription: "Pakke",
                dimensions: {
                  heightInCm: 13,
                  widthInCm: 23,
                  lengthInCm: 10,
                },
                containerId: null,
                packageType: null,
                numberOfItems: null,
                correlationId: "PACKAGE-" + Math.floor(Math.random() * 100000),
              },
            ],
        },
        errors: null,
      },
    ],
  };
}

export async function POST(request) {
  const body = await request.json();
  console.log("Booking request received:", JSON.stringify(body, null, 2));

  if (USE_MOCK) {
    const mockResponse = buildMockResponse(body);
    console.log("Mock response:", JSON.stringify(mockResponse, null, 2));
    return Response.json(mockResponse);
  }

  try {
    const bringResponse = await fetch(BRING_BOOKING_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-bring-client-url": BRING_CLIENT_URL,
        "x-bring-test-indicator": "true",
        "x-mybring-api-key": MYBRING_API_KEY,
        "x-mybring-api-uid": MYBRING_API_UID,
      },
      body: JSON.stringify(body),
    });

    const contentType = bringResponse.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await bringResponse.json()
      : await bringResponse.text();

    console.log("Bring API response:", JSON.stringify(data, null, 2));

    if (!bringResponse.ok) {
      const errorResponse = {
        success: false,
        error: data?.message || "Kunne ikke booke sending med Bring.",
        details: data,
      };
      console.log("Bring API error:", JSON.stringify(errorResponse, null, 2));
      return Response.json(errorResponse, { status: bringResponse.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Bring API fetch error:", error.message);
    return Response.json(
      {
        success: false,
        error: "Kunne ikke kontakte Bring API. Sjekk nettverk og miljøvariabler.",
      },
      { status: 502 }
    );
  }
}
