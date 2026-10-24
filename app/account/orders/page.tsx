
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logoutCustomer } from "@/lib/customer-auth";

type OrderItem = {
  id?: string;
  productId?: string;
  name?: string;
  title?: string;
  image?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
  size?: string;
  color?: string;
};

type CustomerOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  total?: number;
  totalAmount?: number;
  createdAt?: string | number | { seconds?: number };
  items?: OrderItem[];
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: CustomerOrder["createdAt"]) {
  if (!value) return "Date unavailable";

  let date: Date;

  if (typeof value === "object" && "seconds" in value) {
    date = new Date((value.seconds ?? 0) * 1000);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeStatus(order: CustomerOrder) {
  return order.status ?? order.orderStatus ?? "Pending";
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        window.location.replace("/account/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = await user.getIdToken();

        const response = await fetch("/api/customer/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load your orders.");
        }

        if (active) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load orders."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setBusy(true);
    setError("");

    try {
      await logoutCustomer();
      window.location.replace("/account/login");
    } catch {
      setError("Logout failed. Please try again.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p>Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            View your purchases and delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          className="rounded-lg border px-4 py-2 disabled:opacity-60"
        >
          {busy ? "Signing out..." : "Logout"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <section className="mt-8 rounded-xl border p-8 text-center">
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-gray-600">
            Your orders will appear here after checkout.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-lg bg-black px-5 py-3 text-white"
          >
            Browse products
          </Link>
        </section>
      )}

      <div className="mt-8 space-y-5">
        {orders.map((order) => {
          const total = Number(
            order.totalAmount ?? order.total ?? 0
          );

          const status = normalizeStatus(order);

          return (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    Order #{order.orderNumber ?? order.id}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                  {status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(order.items ?? []).map((item, index) => (
                  <div
                    key={item.id ?? item.productId ?? `${order.id}-${index}`}
                    className="flex items-start justify-between gap-3 border-t pt-3"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name ?? item.title ?? "Product"}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity ?? 1}
                        {item.size ? ` · Size: ${item.size}` : ""}
                        {item.color ? ` · Color: ${item.color}` : ""}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm">
                      {formatPrice(
                        Number(item.price ?? item.unitPrice ?? 0) *
                          Number(item.quantity ?? 1)
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-3 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <p className="font-medium">
                    {order.paymentMethod ?? "Cash on Delivery"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.paymentStatus ?? "Payment pending"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Order total</p>
                  <p className="text-lg font-bold">
                    {formatPrice(total)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
