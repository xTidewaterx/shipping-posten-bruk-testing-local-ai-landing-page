"use client";

import { useState } from "react";

const categories = [
  { id: "design", label: "Design", color: "bg-blue-500" },
  { id: "development", label: "Development", color: "bg-green-500" },
  { id: "marketing", label: "Marketing", color: "bg-orange-500" },
  { id: "support", label: "Support", color: "bg-purple-500" },
];

export default function Home() {
  const [value, setValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("design");
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);






async function getValueFromBackend() {

const fetchData = await fetch("/api/check-local");

const response = await fetchData.json();

console.log("Response from backend:", response);
console.log("button clicked, string logged in frontend");


//console.log("Value from backend:", response.value);


}







  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value,
          category: selectedCategory,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ success: false, error: "Failed to submit" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-between py-24 px-8 bg-white dark:bg-black sm:items-center sm:text-center">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
            Submit Form
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
            Enter a value and select a category below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="value"
                className="block text-sm font-medium text-black dark:text-zinc-50"
              >
                Value
              </label>
              <input
                id="value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black placeholder-zinc-400 transition-colors focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/10"
                placeholder="Type something..."
              />
            </div>

            <div className="space-y-3">
              <span className="block text-sm font-medium text-black dark:text-zinc-50">
                Category
              </span>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-black/30 bg-black/5 dark:border-white/20 dark:bg-white/10"
                          : "border-black/10 bg-white hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${cat.color}`}
                      />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-black px-6 py-3 text-base font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>

          {response && (
            <div className="mt-8 w-full rounded-2xl border border-black/10 bg-zinc-50 p-6 text-left dark:border-white/10 dark:bg-white/5">
              <h2 className="text-sm font-semibold text-black dark:text-zinc-50 mb-3">
                Response
              </h2>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>


      <button className="mb-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => console.log("Button clicked!")}> Click me</button>


        <button className="mb-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => getValueFromBackend()}>        Click me</button>

 
    </div>
  );
}
