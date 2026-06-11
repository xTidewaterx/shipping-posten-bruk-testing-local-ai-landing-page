"use client";

import { useState, useEffect } from "react";

const statusConfig = {
  "In Transit": { color: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  Delivered: { color: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  Processing: { color: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/shipping");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col items-center py-24 px-8">
        <div className="w-full">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
            Order Shipping
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
            Track and manage your shipments in one place.
          </p>

          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-black">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50">
                    Order
                  </th>
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50">
                    Customer
                  </th>
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50">
                    Destination
                  </th>
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50">
                    ETA
                  </th>
                  <th className="px-6 py-4 font-semibold text-black dark:text-zinc-50 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = statusConfig[order.status] || { color: "bg-gray-400", text: "text-gray-600" };
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-black/5 last:border-0 dark:border-white/5"
                      >
                        <td className="px-6 py-4 font-medium text-black dark:text-zinc-50">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                          {order.destination}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${status.color}`} />
                            <span className={`text-xs font-medium ${status.text}`}>
                              {order.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                          {order.eta}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                          {order.amount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
