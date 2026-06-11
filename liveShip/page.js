"use client";

import { useState } from "react";

const deliveryMethods = [
  {
    id: "pib",
    label: "Post i Butikk",
    description: "Leverer pakken din på ditt valgte Post i Butikk",
  },
  {
    id: "pickup",
    label: "Henting i postkasse",
    description: "Vi henter pakken din hjemme",
  },
];

const defaultPackage = {
  weightInKg: 1.1,
  heightInCm: 13,
  widthInCm: 23,
  lengthInCm: 10,
  goodsDescription: "Pakke",
};

const defaultShipping = {
  shippingDateTime: new Date().toISOString().slice(0, 16),
  productId: "3622",
  customerNumber: "5",
};

const sender = {
  name: "Ola Nordmann",
  addressLine: "Testsvingen 12",
  postalCode: "0263",
  city: "OSLO",
  email: "ola@nordmanntest.no",
  phoneNumber: "99999999",
};

export default function ShipPage() {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientAddress: "",
    recipientPostalCode: "",
    recipientCity: "",
    recipientEmail: "",
    recipientPhone: "",
    deliveryMethod: "pib",
  });

  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        schemaVersion: 1,
        consignments: [
          {
            shippingDateTime: defaultShipping.shippingDateTime + ":00.000+02:00",
            customerSpecifiedDispatchDateTime:
              formData.deliveryMethod === "pickup"
                ? defaultShipping.shippingDateTime.split("T")[0] + "T07:00:00"
                : undefined,
            parties: {
              sender: {
                name: sender.name,
                addressLine: sender.addressLine,
                addressLine2: null,
                postalCode: sender.postalCode,
                city: sender.city,
                countryCode: "NO",
                reference: "SENDER-REF",
                contact: {
                  name: sender.name,
                  email: sender.email,
                  phoneNumber: sender.phone,
                },
              },
              recipient: {
                name: formData.recipientName,
                addressLine: formData.recipientAddress,
                addressLine2: null,
                postalCode: formData.recipientPostalCode,
                city: formData.recipientCity.toUpperCase(),
                countryCode: "NO",
                reference: "RECIPIENT-REF",
                contact: {
                  name: formData.recipientName,
                  email: formData.recipientEmail,
                  phoneNumber: formData.recipientPhone,
                },
              },
              pickupPoint:
                formData.deliveryMethod === "pib" ? null : undefined,
            },
            product: {
              id: defaultShipping.productId,
              customerNumber: defaultShipping.customerNumber,
              additionalServices:
                formData.deliveryMethod === "pickup"
                  ? [{ id: "1073" }]
                  : [],
            },
            purchaseOrder: null,
            correlationId: "INTERNAL-" + Math.floor(Math.random() * 1000000),
            packages: [
              {
                weightInKg: defaultPackage.weightInKg,
                goodsDescription: defaultPackage.goodsDescription,
                dimensions: {
                  heightInCm: defaultPackage.heightInCm,
                  widthInCm: defaultPackage.widthInCm,
                  lengthInCm: defaultPackage.lengthInCm,
                },
                containerId: null,
                packageType: null,
                numberOfItems: null,
                correlationId: "PACKAGE-" + Math.floor(Math.random() * 100000),
              },
            ],
          },
        ],
      };

      const res = await fetch("/api/book-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: "Kunne ikke booke sending. Prøv igjen senere.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderInput(field, label, type = "text", placeholder = "") {
    return (
      <div className="space-y-2">
        <label
          htmlFor={field}
          className="block text-sm font-medium text-black dark:text-zinc-50"
        >
          {label}
        </label>
        <input
          id={field}
          name={field}
          type={type}
          value={formData[field]}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder-zinc-400 transition-colors focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/10"
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center py-24 px-8">
        <div className="w-full">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
            Opprett sending
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
            Fyll ut mottakerinformasjon for å booke en ny sending med Bring.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                Mottaker
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {renderInput("recipientName", "Navn")}
                {renderInput("recipientAddress", "Gateadresse")}
                {renderInput(
                  "recipientPostalCode",
                  "Postnummer",
                  "text",
                  "0000"
                )}
                {renderInput("recipientCity", "Sted", "text", "OSLO")}
                {renderInput("recipientEmail", "E-post", "email")}
                {renderInput("recipientPhone", "Telefonnummer")}
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                Leveringsmetode
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {deliveryMethods.map((method) => {
                  const isSelected = formData.deliveryMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryMethod: method.id,
                        }))
                      }
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        isSelected
                          ? "border-black/30 bg-black/5 dark:border-white/20 dark:bg-white/10"
                          : "border-black/10 bg-white hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full border ${
                            isSelected
                              ? "border-black bg-black dark:border-white dark:bg-white"
                              : "border-black/30 bg-white dark:border-white/30 dark:bg-black"
                          }`}
                        />
                        <span className="font-medium text-black dark:text-zinc-50">
                          {method.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {method.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-black px-6 py-4 text-base font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              {isSubmitting ? "Booker sending..." : "Book sending"}
            </button>
          </form>

          {response && (
            <div className="mt-10 w-full rounded-2xl border border-black/10 bg-zinc-50 p-8 text-left dark:border-white/10 dark:bg-white/5">
              <h2 className="text-sm font-semibold text-black dark:text-zinc-50 mb-4">
                Bookingrespons
              </h2>
              {response.consignments && response.consignments[0]?.confirmation ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-white p-5 dark:bg-black">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                      Pakkenummer
                    </p>
                    <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                      {response.consignments[0].confirmation.packages[0].packageNumber}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-5 dark:bg-black">
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                        Sendingsnummer
                      </p>
                      <p className="text-sm font-mono text-black dark:text-zinc-50">
                        {response.consignments[0].confirmation.consignmentNumber}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-5 dark:bg-black">
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                        Tracking
                      </p>
                      <a
                        href={response.consignments[0].confirmation.links.tracking}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 underline dark:text-blue-400"
                      >
                        {response.consignments[0].confirmation.links.tracking}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}