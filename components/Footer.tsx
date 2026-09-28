
import Link from "next/link";

const categories = [
  { name: "Shirts", slug: "shirts" },
  { name: "T-Shirts", slug: "t-shirts" },
  { name: "Jeans", slug: "jeans" },
  { name: "Trousers & Pants", slug: "trousers-pants" },
  { name: "Ethnic Wear", slug: "ethnic-wear" },
  { name: "Winter Wear", slug: "winter-wear" },
  { name: "Sportswear", slug: "sportswear" },
  { name: "Suits & Blazers", slug: "suits-blazers" },
];

const policyLinks = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
  {
    name: "Shipping Policy",
    href: "/shipping-policy",
  },
  {
    name: "Return & Refund Policy",
    href: "/return-refund-policy",
  },
  {
    name: "Order Cancellation Policy",
    href: "/order-cancellation-policy",
  },
  {
    name: "Wholesale Policy",
    href: "/wholesale-policy",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold"
            >
              MAHAKAL{" "}
              <span className="text-red-500">
                A TO Z
              </span>
            </Link>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Your wholesale destination for men's wear.
              Explore clothing categories, share your
              requirements and connect with us directly
              for wholesale pricing and bulk orders.
            </p>

            <p className="mt-4 text-sm font-semibold text-red-400">
              Wholesale Men's Wear
            </p>

            <a
              href="https://wa.me/919219495647"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              WhatsApp Us
            </a>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-5 text-lg font-bold">
              Shop Categories
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="transition hover:text-red-400"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-bold">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-red-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="transition hover:text-red-400"
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  href="/enquiry"
                  className="transition hover:text-red-400"
                >
                  Wholesale Enquiry
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-red-400"
                >
                  Contact Us
                </Link>
              </li>
            </ul>

            {/* Policies */}
            <h3 className="mb-5 mt-8 text-lg font-bold">
              Policies
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">
              {policyLinks.map((policy) => (
                <li key={policy.href}>
                  <Link
                    href={policy.href}
                    className="transition hover:text-red-400"
                  >
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-bold">
              Contact Us
            </h3>

            <div className="space-y-4 text-sm text-gray-400">
              <p>
                <span className="mb-1 block font-semibold text-white">
                  Business
                </span>

                Mahakal A To Z
              </p>

              <p>
                <span className="mb-1 block font-semibold text-white">
                  Phone / WhatsApp
                </span>

                <a
                  href="https://wa.me/919219495647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-green-400"
                >
                  +91 92194 95647
                </a>
              </p>

              <p className="text-xs leading-6 text-gray-500">
                For wholesale prices, bulk orders,
                product availability and business
                enquiries, contact us on WhatsApp.
              </p>

              <Link
                href="/enquiry"
                className="inline-flex rounded-lg bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Send Wholesale Enquiry
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Mahakal A To Z.
            All rights reserved.
          </p>

          <p>
            Wholesale Men's Wear | India
          </p>

          <Link
            href="/contact"
            className="transition hover:text-red-400"
          >
            Customer Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
