
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Thank You for Your Order!
        </h1>

        <p className="mt-3 text-gray-600">
          Aapka Cash on Delivery order request receive ho gaya hai.
        </p>

        {orderId ? (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Your Order ID</p>
            <p className="mt-1 break-all font-bold text-gray-900">
              {orderId}
            </p>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(orderId);
              }}
              className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Copy Order ID
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm text-amber-700">
            Order ID nahi mila. Apne order ki confirmation ke liye support se
            sampark karein.
          </p>
        )}

        <p className="mt-5 text-sm text-gray-600">
          Order abhi processing ke liye pending hai. Payment delivery ke samay
          hoga.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-800 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="px-4 py-20 text-center text-gray-600">
          Order confirmation load ho raha hai...
        </main>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}
