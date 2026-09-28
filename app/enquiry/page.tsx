
"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

const WHATSAPP_NUMBER = "919219495647";

function EnquiryFormContent() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    city: "",
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    quantity: "",
    message: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const message = `
NEW WHOLESALE ENQUIRY
----------------------------

Name: ${formData.name}
Mobile: ${formData.phone}
Shop Name: ${formData.businessName}
City: ${formData.city}

Category: ${formData.category}
Product Requirement: ${formData.subcategory || "Not specified"}
Quantity: ${formData.quantity}

Additional Requirements:
${formData.message || "None"}

----------------------------
Enquiry from Mahakal A To Z Website
    `.trim();

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-black px-4 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-extrabold">
            MAHAKAL <span className="text-red-500">A TO Z</span>
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </header>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-red-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600">
              Wholesale Enquiry
            </span>

            <h1 className="mt-5 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Get Wholesale Rates
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Share your shop and product requirements. Submit the form to
              send your enquiry directly to our WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your Full Name *
                </label>

                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold"
                >
                  Mobile Number *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Shop / Business Name *
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your shop name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold"
                >
                  City / State *
                </label>

                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City, State"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product Category *
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
                >
                  <option value="">Select Category</option>
                  <option value="Shirts">Shirts</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Trousers & Pants">
                    Trousers & Pants
                  </option>
                  <option value="Ethnic Wear">Ethnic Wear</option>
                  <option value="Winter Wear">Winter Wear</option>
                  <option value="Sportswear">Sportswear</option>
                  <option value="Suits & Blazers">
                    Suits & Blazers
                  </option>
                  <option value="Innerwear">Innerwear</option>
                  <option value="Nightwear">Nightwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subcategory"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product / Design Requirement
                </label>

                <input
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Formal Shirts, Slim Fit Jeans"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-semibold"
                >
                  Approximate Quantity *
                </label>

                <select
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
                >
                  <option value="">Select Quantity</option>
                  <option value="10-25 pieces">10–25 pieces</option>
                  <option value="26-50 pieces">26–50 pieces</option>
                  <option value="51-100 pieces">51–100 pieces</option>
                  <option value="101-500 pieces">101–500 pieces</option>
                  <option value="500+ pieces">500+ pieces</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Additional Requirements
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Sizes, colours, budget, delivery location..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700"
              >
                Send Enquiry on WhatsApp
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Your enquiry will open in WhatsApp. Please press Send in
                WhatsApp to deliver it to us.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-600">
            Loading enquiry form...
          </p>
        </main>
      }
    >
      <EnquiryFormContent />
    </Suspense>
  );
}
