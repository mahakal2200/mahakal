
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type OrderItem = {
  name?: string;
  quantity?: number;
  size?: string;
  color?: string;
  lineTotal?: number;
};

type Order = {
  id: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalAmount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  customerType?: string;
  createdAt?: string | null;
  items?: OrderItem[];
};

type OrdersResponse = {
  orders?: Order[];
  error?: string;
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function money(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(typeof value === "number" && Number.isFinite(value) ? value : 0);
}

function normalizeStatus(status?: string) {
  return (status || "pending").toLowerCase();
}

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async (current: User) => {
    setLoading(true);
    setError("");

    try {
      const token = await current.getIdToken();

      const response = await fetch("/api/account/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: OrdersResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Orders load nahi hue.");
      }

      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Orders load nahi hue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setAuthReady(true);

      if (!current) {
        setOrders([]);
        setLoading(false);
        router.replace(
          `/account/login?next=${encodeURIComponent("/account/orders")}`
        );
        return;
      }

      void loadOrders(current);
    });

    return unsubscribe;
  }, [loadOrders, router]);

  async function cancelOrder(order: Order) {
    if (!user || busyId) return;

    const status = normalizeStatus(order.status);

    if (!["pending", "confirmed"].includes(status)) {
      setError("Is order ko ab online cancel nahi kiya ja sakta.");
      return;
    }

    const confirmed = window.confirm(
      `Kya aap order ${order.id} cancel karna chahte hain?`
    );

    if (!confirmed) return;

    setBusyId(order.id);
    setError("");
    setNotice("");

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `/api/account/orders/${encodeURIComponent(order.id)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Order cancel nahi hua.");
      }

      setNotice(`Order ${order.id} cancel ho gaya.`);
      await loadOrders(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Order cancel nahi hua."
      );
    } finally {
      setBusyId("");
    }
  }

  async function logout() {
    await signOut(auth);
    router.replace("/");
  }

  if (!authReady) {
    return (
      <main className="px-4 py-20 text-center text-gray-600">
        Account load ho raha hai…
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-600">
              MAHAKAL A TO Z
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              My Account & Orders
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {user?.displayName ||
                user?.email ||
                user?.phoneNumber ||
                "Customer"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold"
            >
              Shop
            </Link>

            <button
              onClick={() => void loadOrders(user!)}
              disabled={!user || loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>

            <button
              onClick={() => void logout()}
              className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              onClick={() => user && void loadOrders(user)}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Order history
            </h2>
            <span className="text-sm text-gray-500">
              {orders.length} orders
            </span>
          </div>

          {loading && orders.length === 0 ? (
            <p className="py-12 text-center text-gray-600">
              Orders load ho rahe hain…
            </p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <h3 className="text-lg font-bold">No orders yet</h3>
              <p className="mt-2 text-sm text-gray-600">
                Aapka pehla order yahan dikhai dega.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex rounded-lg bg-red-600 px-5 py-3 font-bold text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = normalizeStatus(order.status);
                const canCancel = ["pending", "confirmed"].includes(status);

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">ORDER ID</p>
                        <p className="break-all font-bold text-gray-900">
                          {order.id}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {order.createdAt &&
                          Number.isFinite(Date.parse(order.createdAt))
                            ? new Date(order.createdAt).toLocaleString("en-IN")
                            : "Date unavailable"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-bold capitalize text-amber-800">
                          {statusLabel[status] || status}
                        </span>
                        <p className="mt-2 text-lg font-extrabold">
                          {money(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={`${order.id}-${index}`}
                          className="flex flex-wrap justify-between gap-2 py-1 text-sm"
                        >
                          <span>
                            {item.name || "Product"} × {item.quantity || 1}
                            {item.size ? ` · Size: ${item.size}` : ""}
                            {item.color ? ` · Colour: ${item.color}` : ""}
                          </span>
                          <span className="font-semibold">
                            {money(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
                      <span>
                        Subtotal: {money(order.subtotal)} · Delivery:{" "}
                        {money(order.deliveryCharge)}
                      </span>
                      <span>
                        Payment:{" "}
                        {(order.paymentMethod || "COD").toUpperCase()} ·{" "}
                        {(order.paymentStatus || "pending").toLowerCase()}
                      </span>
                    </div>

                    {canCancel && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => void cancelOrder(order)}
                          disabled={busyId !== "" || loading}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === order.id
                            ? "Cancelling…"
                            : "Cancel order"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
