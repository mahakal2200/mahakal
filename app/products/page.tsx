
import Link from "next/link";
import ProductsListingClient from "@/components/ProductsListingClient";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const category = params.category || "";
  const subcategory = params.subcategory || "";

  return {
    title: subcategory
      ? `${subcategory} Wholesale Products | Mahakal A To Z`
      : category
        ? `${category} Wholesale Products | Mahakal A To Z`
        : "Men's Wear Wholesale Products | Mahakal A To Z",

    description:
      "Explore wholesale men's wear products. Contact Mahakal A To Z for bulk orders, product availability and wholesale pricing.",
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const category = params.category || "";
  const subcategory = params.subcategory || "";

  const heading = subcategory
    ? subcategory
    : category
      ? category
      : "All Men's Wear Products";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-black px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-gray-300 hover:text-white"
          >
            ← Back to Home
          </Link>

          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            Mahakal A To Z Wholesale
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            {heading}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-300">
            Explore our wholesale men's wear collection. Contact us for
            bulk pricing, available sizes, colours and stock details.
          </p>

          <Link
            href={`/enquiry?category=${encodeURIComponent(
              category || "Mens Wear"
            )}&subcategory=${encodeURIComponent(subcategory)}`}
            className="mt-7 inline-flex rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Get Wholesale Rates
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {heading}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Products from our current wholesale collection
            </p>
          </div>

          {(category || subcategory) && (
            <Link
              href="/products"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-red-500 hover:text-red-600"
            >
              Clear Filters
            </Link>
          )}
        </div>

        <ProductsListingClient
          category={category}
          subcategory={subcategory}
        />

        {/* Enquiry CTA */}
        <div className="mt-12 rounded-2xl bg-white p-6 text-center shadow-sm sm:p-10">
          <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
            Looking for a particular wholesale design?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Contact Mahakal A To Z for current designs, bulk quantities,
            availability and wholesale pricing.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/enquiry?category=${encodeURIComponent(
                category || "Mens Wear"
              )}&subcategory=${encodeURIComponent(subcategory)}`}
              className="rounded-lg bg-red-600 px-7 py-3 font-bold text-white hover:bg-red-700"
            >
              Send Wholesale Enquiry
            </Link>

            <a
              href="https://wa.me/919219495647"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-green-600 px-7 py-3 font-bold text-green-700 hover:bg-green-50"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
