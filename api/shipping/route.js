const mockOrders = [
  {
    id: "SHP-001",
    customer: "Alice Johnson",
    destination: "Stockholm, Sweden",
    status: "In Transit",
    eta: "2026-06-10",
    amount: "1 249 kr",
  },
  {
    id: "SHP-002",
    customer: "Bob Smith",
    destination: "Oslo, Norway",
    status: "Delivered",
    eta: "2026-06-05",
    amount: "890 kr",
  },
  {
    id: "SHP-003",
    customer: "Carlos Ruiz",
    destination: "Copenhagen, Denmark",
    status: "Processing",
    eta: "2026-06-12",
    amount: "2 100 kr",
  },
  {
    id: "SHP-004",
    customer: "Diana Müller",
    destination: "Helsinki, Finland",
    status: "In Transit",
    eta: "2026-06-09",
    amount: "780 kr",
  },
  {
    id: "SHP-005",
    customer: "Erik Svensson",
    destination: "Berlin, Germany",
    status: "Delivered",
    eta: "2026-06-03",
    amount: "3 450 kr",
  },
];

export async function GET() {
  return Response.json(mockOrders);
}
