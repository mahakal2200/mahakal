
"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function EnquiryPage() {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "";
  const initialSubcategory = searchParams.get("subcategory") || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    city: "",
    category: initialCategory,
    subcategory: initialSubcategory,
    quantity: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Backend integration will be added in the next step.
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black px-4 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-extrabold">
            MAHAKAL <span className="text-red-500">A TO Z</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-gray-300 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Form Section */}
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
              Tell us what you need for your shop. Our team will contact you
              to discuss product availability, wholesale pricing and bulk
              order requirements.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✓
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900">
                  Form Submitted
                </h2>

                <p className="mt-3 text-gray-600">
                  Your form has been validated on this page. Enquiry delivery
                  will be activated after connecting the backend.
                </p>

                <Link
                  href="/"
                  className="mt-7 inline-block rounded-lg bg-red-600 px-7 py-3 font-bold text-white hover:bg-red-700"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Your Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Mobile Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Business */}
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Shop / Business Name *
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter your shop name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    City / State *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Ghazipur, Uttar Pradesh"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Product Category *
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Select Category</option>
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Trousers & Pants">Trousers & Pants</option>
                    <option value="Ethnic Wear">Ethnic Wear</option>
                    <option value="Winter Wear">Winter Wear</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Suits & Blazers">Suits & Blazers</option>
                    <option value="Innerwear">Innerwear</option>
                    <option value="Nightwear">Nightwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label
                    htmlFor="subcategory"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Product / Design Requirement
                  </label>

                  <input
                    id="subcategory"
                    name="subcategory"
                    type="text"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="e.g. Formal Shirts, Slim Fit Jeans"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Approximate Required Quantity *
                  </label>

                  <select
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Select Quantity</option>
                    <option value="10-25 pieces">10–25 pieces</option>
                    <option value="26-50 pieces">26–50 pieces</option>
                    <option value="51-100 pieces">51–100 pieces</option>
                    <option value="101-500 pieces">101–500 pieces</option>
                    <option value="500+ pieces">500+ pieces</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Additional Requirements
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Mention sizes, colours, budget, delivery location or other requirements..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
                >
                  Submit Wholesale Enquiry
                </button>

                <p className="text-center text-xs leading-5 text-gray-500">
                  By submitting, you agree to be contacted regarding your
                  wholesale requirements.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
