
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CART_UPDATED_EVENT,
  getCartItems,
  type CartItem,
} from "@/lib/cart";

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  district: string;
  pinCode: string;
};

function money(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    district: "Ghazipur",
    pinCode: "",
  });

  useEffect(() => {
    const refresh = () => setItems(getCartItems());

    refresh();
    setReady(true);

    window.addEventListener(CART_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
    };
  }, []);

  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Aapka cart khaali hai. Pehle product add karein.");
      return;
    }

    const phone = form.phone.replace(/\D/g, "");
    const pinCode = form.pinCode.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Valid 10-digit Indian mobile number enter karein.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      setError("Valid 6-digit PIN code enter karein.");
      return;
    }

    if (form.name.trim().length < 2) {
      setError("Apna poora naam enter karein.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone,
            address: form.address.trim(),
            landmark: form.landmark.trim(),
            city: form.city.trim(),
            district: form.district.trim(),
            pinCode,
          },
          paymentMethod: "COD",
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Order place nahi ho paaya. Dobara try karein.";

        throw new Error(message);
      }

      if (
        !result ||
        typeof result !== "object" ||
        !("orderId" in result) ||
        typeof result.orderId !== "string"
      ) {
        throw new Error("Order confirmation receive nahi hua.");
      }

      router.push(
        `/order-success?orderId=${encodeURIComponent(result.orderId)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Order place nahi ho paaya. Dobara try karein."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <main className="px-4 py-20 text-center text-gray-600">
        Checkout load ho raha hai...
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-gray-600">
            Checkout se pehle cart mein products add karein.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 font-bold text-white"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Checkout
        </h1>
        <p className="mt-2 text-gray-600">
          Delivery details enter karein aur apna order review karein.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]"
        >
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Address
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Customer ka naam"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Mobile Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  House Number, Street, Mohalla, Village *
                </label>
                <textarea
                  id="address"
                  required
                  autoComplete="street-address"
                  maxLength={300}
                  rows={3}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Complete delivery address"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="landmark" className="text-sm font-semibold text-gray-700">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  maxLength={150}
                  value={form.landmark}
                  onChange={(e) => updateField("landmark", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Nearby school, shop, etc."
                />
              </div>

              <div>
                <label htmlFor="city" className="text-sm font-semibold text-gray-700">
                  City / Village *
                </label>
                <input
                  id="city"
                  required
                  autoComplete="address-level2"
                  maxLength={100}
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="City or village"
                />
              </div>

              <div>
                <label htmlFor="district" className="text-sm font-semibold text-gray-700">
                  District *
                </label>
                <input
                  id="district"
                  required
                  maxLength={100}
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="pinCode" className="text-sm font-semibold text-gray-700">
                  PIN Code *
                </label>
                <input
                  id="pinCode"
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  value={form.pinCode}
                  onChange={(e) =>
                    updateField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="6-digit PIN"
                />
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-800">
                Cash on Delivery (COD)
              </p>
              <p className="mt-1 text-sm text-green-700">
                Payment delivery ke samay hoga, agar aapke address par COD service available hai.
              </p>
            </div>

            {error && (
              <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Processing..." : "Place COD Order"}
            </button>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Order place karne par aapki delivery details order processing ke liye use hongi.
            </p>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-3"
                >
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {item.quantity}
                      {item.size ? ` · Size: ${item.size}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    {money(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
              <div className="flex justify-between gap-4 text-gray-600">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <span>Delivery Charges</span>
                <span>To be confirmed</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-lg font-extrabold text-gray-900">
                <span>Product Total</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
