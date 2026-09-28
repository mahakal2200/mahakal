
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

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-xl font-black tracking-tight text-black sm:text-2xl">
              MAHAKAL <span className="text-red-600">A TO Z</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Men's Wear Wholesale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-700 transition hover:text-red-600"
            >
              Home
            </Link>

            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 py-5 text-sm font-semibold text-gray-700 transition hover:text-red-600"
              >
                Categories
                <span className="text-xs">▼</span>
              </button>

              <div className="invisible absolute left-0 top-full w-64 translate-y-2 rounded-xl border border-gray-100 bg-white p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-gray-700 transition hover:text-red-600"
            >
              Products
            </Link>
          </nav>

          {/* Enquiry CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/enquiry"
              className="hidden rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 sm:inline-flex"
            >
              Wholesale Enquiry
            </Link>

            <a
              href="https://wa.me/919219495647"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              <span aria-hidden="true">☏</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex gap-5 overflow-x-auto border-t border-gray-100 py-3 lg:hidden">
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold text-gray-700"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="shrink-0 text-xs font-semibold text-gray-700"
          >
            All Products
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="shrink-0 text-xs font-semibold text-gray-700"
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/enquiry"
            className="shrink-0 text-xs font-semibold text-red-600"
          >
            Enquiry
          </Link>
        </nav>
      </div>
    </header>
  );
}
