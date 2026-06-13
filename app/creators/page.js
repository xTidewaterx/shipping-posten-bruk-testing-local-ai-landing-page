export const metadata = {
  title: "Creator Profile | Shipping App",
  description: "A simple creator profile for the shipping experience.",
};

const creator = {
  name: "Maja Solberg",
  role: "Creator · Design & Systems",
  headline: "Maja Solberg designs the calm inside every shipment.",
  text: [
    "Maja is the creator behind the quiet confidence of the shipping experience. Her work turns complex routes, addresses, pickup points, and checkout decisions into a flow that feels direct and human.",
    "She thinks in systems first: what needs to be visible, what can wait, and what should disappear completely. The result is an interface that feels edited, not empty.",
    "Her profile is built around one idea: shipping should feel clear before it feels fast. Every line of text, every button, and every moment of guidance is designed to help people move forward without friction.",
  ],
};

const products = [
  {
    name: "Pickup Points",
    text: "Find nearby pickup locations and choose the handoff that fits the order.",
  },
  {
    name: "Address Lookup",
    text: "Guide customers into a valid address before the shipment is created.",
  },
  {
    name: "Shipment Booking",
    text: "Create a shipment with clear details, package data, and confirmation.",
  },
];

export default function CreatorProfilePage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-white font-sans dark:bg-zinc-950">
      <main className="w-full max-w-3xl px-6 py-16 sm:px-8 md:py-24">
        <article className="overflow-hidden bg-white dark:bg-zinc-950">
          <div className="relative flex h-72 items-end justify-end bg-black px-8 py-6 text-sm font-bold uppercase tracking-[0.28em] text-white dark:bg-white dark:text-black">
            <span>01</span>
          </div>

          <div className="px-8 py-12 text-center sm:px-12 md:px-16">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
              {creator.role}
            </p>

            <h1 className="mx-auto mt-8 max-w-2xl font-serif text-5xl font-black uppercase leading-none tracking-[0.08em] text-black dark:text-zinc-50">
              {creator.headline}
            </h1>

            <div className="mx-auto my-12 h-px w-24 bg-black dark:bg-white" />

            <div className="space-y-6 text-left">
              {creator.text.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <section className="border-t border-black/10 px-8 py-12 dark:border-white/10 sm:px-12 md:px-16">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
              Products
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="flex h-full min-h-64 flex-col justify-between rounded-sm bg-zinc-50 p-8 dark:bg-zinc-900"
                >
                  <h2 className="font-serif text-sm font-black leading-tight tracking-[-0.03em] text-black dark:text-zinc-50">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {product.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <footer className="border-t border-black/10 px-8 py-8 text-center text-sm font-bold uppercase tracking-[0.28em] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {creator.name}
          </footer>
        </article>
      </main>
    </div>
  );
}
