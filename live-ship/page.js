"use client";

import { useState, useEffect, useRef } from "react";

const deliveryMethods = [
  {
    id: "pib",
    label: "Post i Butikk",
    description: "Leverer pakken din på ditt valgte Post i Butikk",
    productId: "3067",
    requiresPickupPoint: true,
  },
  {
    id: "pickup",
    label: "Henting i postkasse",
    description: "Vi henter pakken din hjemme",
    productId: "3622",
    requiresPickupPoint: false,
  },
];

const defaultPackage = {
  weightInKg: 1.1,
  heightInCm: 13,
  widthInCm: 23,
  lengthInCm: 10,
  goodsDescription: "Pakke",
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
    pickupPointId: "",
    pickupPointName: "",
  });

  const [streetInput, setStreetInput] = useState("");

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [pickupPoints, setPickupPoints] = useState([]);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);
  const [showPickupPoints, setShowPickupPoints] = useState(false);

  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAddress = deliveryMethods.find((m) => m.id === formData.deliveryMethod);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = streetInput.trim();
      if (query.length < 2) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingAddresses(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "5" });
        if (formData.recipientPostalCode.trim()) {
          params.set("postalCode", formData.recipientPostalCode.trim());
        }

        const res = await fetch(`/api/address?${params}`);
        const data = await res.json();

        if (res.ok && data.addresses) {
          setAddressSuggestions(data.addresses);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingAddresses(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [streetInput, formData.recipientPostalCode]);

  function selectAddress(addr) {
    setFormData((prev) => ({
      ...prev,
      recipientAddress: `${addr.street_name} ${addr.house_number}${addr.letter ? addr.letter : ""}`.trim(),
      recipientPostalCode: addr.postal_code,
      recipientCity: addr.city,
    }));
    setStreetInput("");
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setShowPickupPoints(false);
    setFormData((prev) => ({ ...prev, pickupPointId: "", pickupPointName: "" }));
  }

  async function handleShowPickupPoints() {
    setLoadingPickupPoints(true);
    setShowPickupPoints(true);

    try {
      const params = new URLSearchParams({ postalCode: formData.recipientPostalCode });
      if (formData.recipientAddress) {
        const match = formData.recipientAddress.match(/^(.+?)\s+(\d+)/);
        if (match) {
          params.set("street", match[1]);
          params.set("streetNumber", match[2]);
        }
      }

      const res = await fetch(`/api/pickup-points?${params}`);
      const data = await res.json();

      if (res.ok && data.pickupPoints) {
        setPickupPoints(data.pickupPoints);
      } else {
        setPickupPoints([]);
      }
    } catch {
      setPickupPoints([]);
    } finally {
      setLoadingPickupPoints(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      now.setHours(now.getHours() + 24, 0, 0, 0);
      const shippingDateTime = now.toISOString().replace("Z", "+02:00");

      const productId =
        deliveryMethods.find((m) => m.id === formData.deliveryMethod)?.productId || "3622";

      const payload = {
        schemaVersion: 1,
        consignments: [
          {
            shippingDateTime,
            customerSpecifiedDispatchDateTime:
              formData.deliveryMethod === "pickup"
                ? shippingDateTime.split("T")[0] + "T07:00:00"
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
                  phoneNumber: sender.phoneNumber,
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
                formData.deliveryMethod === "pib" && formData.pickupPointId
                  ? {
                      id: formData.pickupPointId,
                      countryCode: "NO",
                    }
                  : formData.deliveryMethod === "pib"
                  ? null
                  : undefined,
            },
            product: {
              id: productId,
              customerNumber: "5",
              additionalServices:
                formData.deliveryMethod === "pickup" ? [{ id: "1073" }] : [],
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
          Accept: "application/json",
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

                <div className="space-y-2">
                  <label htmlFor="recipientAddress" className="block text-sm font-medium text-black dark:text-zinc-50">
                    Gateadresse
                  </label>
                  <div className="relative" ref={suggestionsRef}>
                    <input
                      id="recipientAddress"
                      name="recipientAddress"
                      type="text"
                      value={streetInput || formData.recipientAddress}
                      onChange={(e) => {
                        setStreetInput(e.target.value);
                        handleChange({ target: { name: "recipientAddress", value: e.target.value } });
                      }}
                      onFocus={() => {
                        if (addressSuggestions.length > 0) setShowSuggestions(true);
                      }}
                      required
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder-zinc-400 transition-colors focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/10"
                      placeholder="Start å skriv en adresse..."
                      autoComplete="off"
                    />
                    {loadingAddresses && (
                      <span className="absolute right-3 top-3.5 text-xs text-zinc-400">Søker...</span>
                    )}
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-black">
                        {addressSuggestions.map((addr) => (
                          <li
                            key={addr.address_id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectAddress(addr);
                            }}
                            className="cursor-pointer px-4 py-3 text-sm text-black transition-colors hover:bg-black/5 dark:text-zinc-50 dark:hover:bg-white/10"
                          >
                            <span className="font-medium">{addr.street_name} {addr.house_number}{addr.letter ? addr.letter : ""}</span>
                            <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                              {addr.postal_code} {addr.city}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {showSuggestions && !loadingAddresses && addressSuggestions.length === 0 && streetInput.length >= 2 && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-xs text-zinc-500 shadow-lg dark:border-white/10 dark:bg-black dark:text-zinc-400">
                        Ingen adresseforslag funnet
                      </div>
                    )}
                  </div>
                </div>

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
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          deliveryMethod: method.id,
                          pickupPointId: "",
                          pickupPointName: "",
                          pickupPointId: "",
                        }));
                        setShowPickupPoints(false);
                      }}
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

            {formData.deliveryMethod === "pib" && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                  Post i Butikk
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  {formData.pickupPointId && (
                    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
                      <p className="text-sm text-black dark:text-zinc-50">
                        Valgt hentested: <span className="font-semibold">{formData.pickupPointName || formData.pickupPointId}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, pickupPointId: "", pickupPointName: "" }))}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Fjern valg
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleShowPickupPoints}
                    disabled={!formData.recipientPostalCode || loadingPickupPoints}
                    className="rounded-2xl border border-black/10 bg-white px-6 py-4 text-left text-sm text-zinc-600 transition-colors hover:border-black/20 disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-zinc-400 dark:hover:border-white/20"
                  >
                    {loadingPickupPoints ? "Henter hentesteder..." : "Vis nærliggende hentesteder for denne adressen"}
                  </button>

                  {showPickupPoints && pickupPoints.length > 0 && !formData.pickupPointId && (
                    <div className="space-y-3">
                      {pickupPoints.slice(0, 5).map((pp) => (
                        <button
                          key={pp.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              pickupPointId: pp.id,
                              pickupPointName: pp.name || pp.id,
                            }));
                            setShowPickupPoints(false);
                          }}
                          className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white p-4 text-left transition-colors hover:border-black/20 dark:border-white/10 dark:bg-black dark:hover:border-white/20"
                        >
                          <div>
                            <p className="text-sm font-medium text-black dark:text-zinc-50">
                              {pp.name || pp.id}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {pp.address}, {pp.postalCode} {pp.city}
                            </p>
                            {pp.distanceInKm && (
                              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                {pp.distanceInKm} km · {pp.durationInMinutes} min
                              </p>
                            )}
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            pp.pickupPointType === "LOCKER"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          }`}>
                            {pp.pickupPointType === "LOCKER" ? "Pakkeboks" : "Butikk"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showPickupPoints && !loadingPickupPoints && pickupPoints.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Ingen hentesteder funnet.</p>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-5">
              <p className="text-sm font-medium text-black dark:text-zinc-50">
                Sendingsdato
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sendingen planlegges for om 7 dager. Du vil få følgenummer og sporingslenke ved booking.
              </p>
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
                  {response.consignments[0].confirmation.packages && (
                    <div className="rounded-xl bg-white p-5 dark:bg-black">
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                        Pakkenummer
                      </p>
                      <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                        {response.consignments[0].confirmation.packages[0]?.packageNumber}
                      </p>
                    </div>
                  )}
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
