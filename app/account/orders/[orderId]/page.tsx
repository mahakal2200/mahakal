
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type OrderItem = {
  productId?: string;
  id?: string;
  name?: string;
  image?: string;
  quantity?: number;
  size?: string;
  color?: string;
  unitPrice?: number;
  price?: number;
  lineTotal?: number;
};

type Address = {
  name?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
};

type Order = {
  id: string;
  orderId?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalAmount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  currency?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deliveryStatus?: string;
  deliveryDistanceKm?: number | null;
  customer?: Address;
  shippingAddress?: Address;
  address?: Address;
  items?: OrderItem[];
};

type ApiResponse = {
  order?: Order;
  error?: string;
};

const statusSteps = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function money(value: unknown) {
  const amount =
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeStatus(status?: string) {
  return (status || "pending").toLowerCase();
}

function getItemTotal(item: OrderItem) {
  if (typeof item.lineTotal === "number") return item.lineTotal;

  const unitPrice =
    typeof item.unitPrice === "number"
      ? item.unitPrice
      : typeof item.price === "number"
        ? item.price
        : 0;

  return unitPrice * (item.quantity || 1);
}

export default function CustomerOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId;

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async (currentUser: User) => {
    setLoading(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch(
        `/api/customer/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Order details load nahi hue.");
      }

      if (!result.order) {
        throw new Error("Order details nahi mile.");
      }

      setOrder(result.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Order details load nahi hue."
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        setOrder(null);
        setLoading(false);
        router.replace(
          `/account/login?next=${encodeURIComponent(
            `/account/orders/${orderId}`
          )}`
        );
        return;
      }

      void loadOrder(currentUser);
    });

    return unsubscribe;
  }, [loadOrder, orderId, router]);

  if (!authReady || loading) {
    return (
      <main className="px-4 py-20 text-center text-gray-600">
        Order details load ho rahi hain…
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Order details unavailable
          </h1>

          <p role="alert" className="mt-3 text-sm text-red-600">
            {error || "Order nahi mila."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => user && void loadOrder(user)}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Try again
            </button>

            <Link
              href="/account/orders"
              className="rounded-lg border px-5 py-3 font-semibold"
            >
              My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const status = normalizeStatus(order.status);
  const isCancelled = status === "cancelled";
  const currentStep = statusSteps.indexOf(status);

  const shipping =
    order.shippingAddress || order.address || order.customer || {};

  const addressLines = [
    shipping.addressLine1 || shipping.address,
    shipping.addressLine2,
    shipping.city || shipping.district,
    shipping.state,
    shipping.pincode,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600"
        >
          ← Back to My Orders
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-600">
              MAHAKAL A TO Z
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              Order Details
            </h1>
            <p className="mt-2 break-all text-sm text-gray-600">
              Order ID: {order.orderId || order.id}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            onClick={() => user && void loadOrder(user)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold"
          >
            Refresh status
          </button>
        </header>

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Order status</h2>

            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                isCancelled
                  ? "bg-red-50 text-red-700"
                  : status === "delivered"
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-800"
              }`}
            >
              {statusLabels[status] || status}
            </span>
          </div>

          {isCancelled ? (
            <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Yeh order cancel ho chuka hai.
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {statusSteps.map((step, index) => {
                const completed = currentStep >= index;

                return (
                  <li key={step} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </span>

                    <div>
                      <p
                        className={`font-semibold ${
                          completed ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {statusLabels[step]}
                      </p>
                      {step === status && (
                        <p className="mt-1 text-sm text-gray-500">
                          Current order status
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {order.deliveryStatus && (
            <p className="mt-5 border-t pt-4 text-sm text-gray-600">
              Delivery status:{" "}
              <span className="font-semibold text-gray-900">
                {order.deliveryStatus}
              </span>
            </p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Products ordered
          </h2>

          <div className="mt-4 divide-y divide-gray-100">
            {(order.items || []).map((item, index) => (
              <div
                key={`${item.productId || item.id || item.name || "item"}-${index}`}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {item.name || "Product"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Qty: {item.quantity || 1}
                    {item.size ? ` · Size: ${item.size}` : ""}
                    {item.color ? ` · Colour: ${item.color}` : ""}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Unit price:{" "}
                    {money(
                      typeof item.unitPrice === "number"
                        ? item.unitPrice
                        : item.price
                    )}
                  </p>
                </div>

                <p className="shrink-0 font-bold text-gray-900">
                  {money(getItemTotal(item))}
                </p>
              </div>
            ))}

            {(!order.items || order.items.length === 0) && (
              <p className="py-5 text-sm text-gray-500">
                Product details available nahi hain.
              </p>
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Delivery address
            </h2>

            <p className="mt-4 font-semibold text-gray-800">
              {shipping.fullName || shipping.name || "Customer"}
            </p>

            {shipping.phone && (
              <p className="mt-1 text-sm text-gray-600">
                Phone: {shipping.phone}
              </p>
            )}

            {addressLines.length > 0 ? (
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {addressLines.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                Address details available nahi hain.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Payment summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Delivery charge</span>
                <span>{money(order.deliveryCharge)}</span>
              </div>

              <div className="flex justify-between gap-3 border-t pt-3 text-base font-extrabold">
                <span>Total</span>
                <span>{money(order.totalAmount)}</span>
              </div>

              <div className="border-t pt-3">
                <p className="text-gray-600">Payment method</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {(order.paymentMethod || "COD").toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Payment status</p>
                <p className="mt-1 font-semibold capitalize text-gray-900">
                  {(order.paymentStatus || "pending").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/orders"
            className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white"
          >
            All Orders
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
