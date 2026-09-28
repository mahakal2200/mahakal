
import Link from "next/link";

const policyLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
  {
    label: "Shipping Policy",
    href: "/shipping-policy",
  },
  {
    label: "Return & Refund Policy",
    href: "/return-refund-policy",
  },
  {
    label: "Order Cancellation",
    href: "/order-cancellation-policy",
  },
  {
    label: "Wholesale Policy",
    href: "/wholesale-policy",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-12 bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold">
              Mahakal A To Z
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-300">
              Wholesale men's wear for retailers,
              resellers and bulk buyers. Contact us for
              product catalogues, wholesale prices and
              business enquiries.
            </p>

            <a
              href="https://wa.me/919219495647"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              WhatsApp: 9219495647
            </a>
          </div>

          <div>
            <h3 className="font-semibold">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300">
              <Link href="/" className="hover:text-white">
                Home
              </Link>

              <Link href="/products" className="hover:text-white">
                Products
              </Link>

              <Link href="/enquiry" className="hover:text-white">
                Send an Enquiry
              </Link>

              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">
              Policies & Information
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300">
              {policyLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Mahakal A To Z.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
