
"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copyMessage, setCopyMessage] = useState("");

  async function copyOrderId() {
    if (!orderId) return;

    try {
      if (!navigator.clipboard?.writeText) {
        setCopyMessage(
          "Copy support nahi hai. Order ID ko manually copy karein."
        );
        return;
      }

      await navigator.clipboard.writeText(orderId);
      setCopyMessage("Order ID copied!");
    } catch {
      setCopyMessage(
        "Order ID copy nahi hua. Ise manually copy karein."
      );
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700"
          aria-hidden="true"
        >
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Thank You for Your Order!
        </h1>

        <p className="mt-3 text-gray-600">
          Aapka Cash on Delivery order request receive ho gaya hai.
        </p>

        {orderId ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Your Order ID
            </p>

            <p className="mt-2 break-all font-bold text-gray-900">
              {orderId}
            </p>

            <button
              type="button"
              onClick={() => void copyOrderId()}
              className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Copy Order ID
            </button>

            {copyMessage && (
              <p
                role="status"
                aria-live="polite"
                className="mt-2 text-sm text-gray-600"
              >
                {copyMessage}
              </p>
            )}
          </div>
        ) : (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
          >
            Order ID URL mein nahi mila. Apne orders check karein
            ya support se sampark karein.
          </p>
        )}

        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left">
          <h2 className="font-bold text-blue-900">
            What happens next?
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Aapka order confirmation ke baad process kiya jayega.
            Order status dekhne ke liye My Orders section kholein.
            COD payment delivery ke samay kiya jayega.
          </p>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/account/orders"
            className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            View My Orders
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-800 hover:bg-gray-50"
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
