
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CART_UPDATED_EVENT,
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";

function money(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const refreshCart = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    refreshCart();
    setReady(true);

    window.addEventListener(CART_UPDATED_EVENT, refreshCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
    };
  }, [refreshCart]);

  function changeQuantity(item: CartItem, quantity: number) {
    updateCartQuantity(
      item.id,
      item.size,
      item.color,
      quantity
    );
    refreshCart();
  }

  function deleteItem(item: CartItem) {
    removeFromCart(item.id, item.size, item.color);
    refreshCart();
  }

  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  if (!ready) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <p className="text-center text-gray-600">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Your Shopping Cart
            </h1>
            <p className="mt-2 text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link
            href="/products"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 hover:border-red-500 hover:text-red-600"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-6xl">🛒</div>
            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-3 text-gray-600">
              Apne pasand ke clothing products add karein.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row"
                >
                  <Link
                    href={`/products/${encodeURIComponent(item.slug)}`}
                    className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-28"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        👕
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${encodeURIComponent(item.slug)}`}
                      className="font-bold text-gray-900 hover:text-red-600"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.size ? `Size: ${item.size}` : "Size: Not specified"}
                      {" · "}
                      {item.color ? `Colour: ${item.color}` : "Colour: Not specified"}
                    </p>

                    <p className="mt-2 font-bold text-red-600">
                      {money(item.unitPrice)} each
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() => changeQuantity(item, item.quantity - 1)}
                          className="px-3 py-1.5 disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-10 border-x border-gray-300 px-3 py-1.5 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          disabled={item.quantity >= item.stock}
                          onClick={() => changeQuantity(item, item.quantity + 1)}
                          className="px-3 py-1.5 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-extrabold text-gray-900">
                        {money(item.unitPrice * item.quantity)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteItem(item)}
                      className="mt-3 self-start text-sm font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={() => {
                  clearCart();
                  refreshCart();
                }}
                className="text-sm font-semibold text-gray-500 hover:text-red-600"
              >
                Clear Cart
              </button>
            </section>

            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 flex justify-between gap-4 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {money(subtotal)}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-gray-600">
                <span>Delivery</span>
                <span className="text-right text-sm">Calculated at checkout</span>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-5">
                <div className="flex justify-between gap-4">
                  <span className="font-bold text-gray-900">Subtotal</span>
                  <span className="text-xl font-extrabold text-red-600">
                    {money(subtotal)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Final payable amount delivery charges aur checkout par confirm hone wali details ke baad pata chalega.
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                Cart ready hai. Customer details, address, stock recheck aur Cash on Delivery order placement agle step mein connect karenge.
              </div>

              <Link
                href="/products"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
