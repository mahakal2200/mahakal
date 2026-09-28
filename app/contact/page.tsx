
import Link from "next/link";

export const metadata = {
  title: "Contact Us | Mahakal A To Z",
  description:
    "Contact Mahakal A To Z for wholesale men's wear enquiries, bulk orders and business support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Home
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Contact Us
          </h1>

          <p className="mt-3 text-gray-600">
            Welcome to Mahakal A To Z. For wholesale men's
            wear enquiries, bulk orders, product availability
            and business-related assistance, please contact us.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                WhatsApp Support
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Contact us directly for product catalogues,
                wholesale prices and bulk order enquiries.
              </p>

              <a
                href="https://wa.me/919219495647"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Chat on WhatsApp
              </a>

              <p className="mt-3 text-sm text-gray-500">
                +91 92194 95647
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Business Enquiries
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Retailers and resellers can contact us for
                wholesale rates, minimum order quantities
                and product availability.
              </p>

              <Link
                href="/enquiry"
                className="mt-4 inline-flex rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Send an Enquiry
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Support
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              For order-related questions, please mention
              your order or enquiry reference, product name
              and registered contact number while contacting
              us.
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Business address and official email:
              Please contact us through WhatsApp for current
              business contact details.
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Policies
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <Link href="/terms-and-conditions" className="text-blue-700 hover:underline">
                Terms & Conditions
              </Link>

              <Link href="/shipping-policy" className="text-blue-700 hover:underline">
                Shipping Policy
              </Link>

              <Link href="/return-refund-policy" className="text-blue-700 hover:underline">
                Return & Refund Policy
              </Link>

              <Link href="/order-cancellation-policy" className="text-blue-700 hover:underline">
                Cancellation Policy
              </Link>

              <Link href="/wholesale-policy" className="text-blue-700 hover:underline">
                Wholesale Policy
              </Link>

              <Link href="/privacy-policy" className="text-blue-700 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
