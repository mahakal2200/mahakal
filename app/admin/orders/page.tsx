
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

type OrderItem = {
  productId?: string;
  name?: string;
  title?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
};

type AdminOrder = {
  id: string;
  orderNumber?: string;
  customerId?: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  status?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  total?: number;
  totalAmount?: number;
  createdAt?: string;
  items?: OrderItem[];
};

const STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-IN");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async (token: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace("/account/login");
        return;
      }

      const token = await user.getIdToken();
      await loadOrders(token);
    });

    return unsubscribe;
  }, [loadOrders]);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    setError("");

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Please sign in again.");
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update order.");
      }

      await loadOrders(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const status = order.status ?? order.orderStatus ?? "Pending";
    return filter === "All" || status === filter;
  });

  const pendingCount = orders.filter(
    (order) => (order.status ?? order.orderStatus ?? "Pending") === "Pending"
  ).length;

  const deliveredTotal = orders
    .filter(
      (order) =>
        (order.status ?? order.orderStatus) === "Delivered"
    )
    .reduce(
      (sum, order) => sum + Number(order.totalAmount ?? order.total ?? 0),
      0
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review orders and manage fulfilment.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border px-4 py-2"
        >
          Admin Dashboard
        </Link>
      </header>

      {error && (
        <div role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total orders loaded</p>
          <p className="mt-2 text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Pending orders</p>
          <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Delivered order value</p>
          <p className="mt-2 text-2xl font-bold">
            {formatPrice(deliveredTotal)}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="order-filter" className="font-medium">
            Filter status
          </label>

          <select
            id="order-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option value="All">All orders</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const user = auth.currentUser;
              if (user) {
                void user.getIdToken().then(loadOrders);
              }
            }}
            className="rounded-lg border px-4 py-2"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-10">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="py-10 text-gray-500">No orders found.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredOrders.map((order) => {
              const status =
                order.status ?? order.orderStatus ?? "Pending";

              const total = Number(
                order.totalAmount ?? order.total ?? 0
              );

              return (
                <article
                  key={order.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">
                        Order #{order.orderNumber ?? order.id}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-2 text-sm">
                        Customer: {order.customerName ?? "Name unavailable"}
                      </p>
                      <p className="text-sm">
                        Phone: {order.customerPhone ?? "Not provided"}
                      </p>
                      <p className="text-sm">
                        Customer UID: {order.customerId ?? order.userId ?? "Not linked"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatPrice(total)}
                      </p>
                      <p className="mt-1 text-sm">
                        {order.paymentMethod ?? "COD"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Payment: {order.paymentStatus ?? "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium">Items</h3>

                    <ul className="mt-2 space-y-2">
                      {(order.items ?? []).map((item, index) => (
                        <li
                          key={`${order.id}-${index}`}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span>
                            {item.name ?? item.title ?? "Product"} ×{" "}
                            {item.quantity ?? 1}
                          </span>
                          <span>
                            {formatPrice(
                              Number(item.price ?? item.unitPrice ?? 0) *
                                Number(item.quantity ?? 1)
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                      {status}
                    </span>

                    <label className="flex items-center gap-2 text-sm">
                      Update status
                      <select
                        value={status}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          void updateStatus(order.id, event.target.value)
                        }
                        className="rounded-lg border px-3 py-2"
                      >
                        {STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
