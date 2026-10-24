
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

type DashboardOrder = {
  id: string;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  total?: number;
  totalAmount?: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (token: string) => {
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
        throw new Error(data.error ?? "Unable to load dashboard.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
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

      try {
        const token = await user.getIdToken();
        await loadDashboard(token);
      } catch {
        setError("Please sign in again.");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [loadDashboard]);

  const getStatus = (order: DashboardOrder) =>
    order.status ?? order.orderStatus ?? "Pending";

  const pending = orders.filter(
    (order) => getStatus(order) === "Pending"
  ).length;

  const processing = orders.filter((order) =>
    ["Confirmed", "Packed", "Shipped"].includes(getStatus(order))
  ).length;

  const delivered = orders.filter(
    (order) => getStatus(order) === "Delivered"
  );

  const cancelled = orders.filter(
    (order) => getStatus(order) === "Cancelled"
  ).length;

  const deliveredValue = delivered.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount ?? order.total ?? 0),
    0
  );

  const collectedCod = delivered
    .filter(
      (order) =>
        (order.paymentStatus ?? "").toLowerCase() === "paid" ||
        (order.paymentStatus ?? "").toLowerCase() === "collected"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.totalAmount ?? order.total ?? 0),
      0
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor orders and manage your Mahakal store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const user = auth.currentUser;
            if (user) {
              void user.getIdToken().then(loadDashboard);
            }
          }}
          disabled={loading}
          className="rounded-lg border px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-12">Loading dashboard...</p>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Orders loaded"
              value={String(orders.length)}
            />
            <Metric
              label="Pending orders"
              value={String(pending)}
            />
            <Metric
              label="Processing / shipped"
              value={String(processing)}
            />
            <Metric
              label="Delivered orders"
              value={String(delivered.length)}
            />
            <Metric
              label="Cancelled orders"
              value={String(cancelled)}
            />
            <Metric
              label="Delivered order value"
              value={formatPrice(deliveredValue)}
            />
            <Metric
              label="Recorded COD collection"
              value={formatPrice(collectedCod)}
            />
          </section>

          <section className="mt-8 rounded-xl border p-5">
            <h2 className="text-xl font-semibold">Quick actions</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/orders"
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                Manage orders
              </Link>

              <Link
                href="/admin/products"
                className="rounded-lg border px-5 py-3"
              >
                Manage products
              </Link>

              <Link
                href="/admin/categories"
                className="rounded-lg border px-5 py-3"
              >
                Manage categories
              </Link>
            </div>
          </section>

          <p className="mt-5 text-sm text-gray-500">
            Dashboard figures are based on the orders returned by the
            current API page. For complete business analytics, add
            server-side aggregation and pagination.
          </p>
        </>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-bold">{value}</p>
    </article>
  );
}
