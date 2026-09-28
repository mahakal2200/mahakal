
import Link from "next/link";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
  }>;
};

const formatName = (value?: string) => {
  if (!value) return "";

  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const category = params.category || "";
  const subcategory = params.subcategory || "";

  const categoryName = formatName(category);
  const subcategoryName = formatName(subcategory);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-5 inline-block text-sm text-gray-300 hover:text-white"
          >
            ← Back to Home
          </Link>

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-400">
            Mahakal A To Z Wholesale
          </p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {subcategoryName || categoryName || "Men's Wear Products"}
          </h1>

          <p className="mt-3 max-w-2xl text-gray-300">
            Explore our wholesale men's wear collection. Contact us directly
            for wholesale rates, sizes, colours and bulk order requirements.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <span>/</span>

          <span>Products</span>

          {categoryName && (
            <>
              <span>/</span>
              <span>{categoryName}</span>
            </>
          )}

          {subcategoryName && (
            <>
              <span>/</span>
              <span className="font-semibold text-gray-900">
                {subcategoryName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Product Listing */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Wholesale Collection
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {categoryName
                ? `Category: ${categoryName}`
                : "Explore our men's wear categories"}
              {subcategoryName ? ` | ${subcategoryName}` : ""}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-red-600 hover:text-red-600"
          >
            Browse Categories
          </Link>
        </div>

        {/* Empty product state until real inventory is added */}
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">
            👔
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Products Coming Soon
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            We are updating our wholesale collection. For current designs,
            available sizes, colours and bulk pricing, send us your
            requirements directly.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/enquiry?category=${encodeURIComponent(
                categoryName || "Mens Wear"
              )}&subcategory=${encodeURIComponent(subcategoryName)}`}
              className="rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Enquire for Wholesale Rates
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="bg-red-600 px-4 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-extrabold">
              Looking for Bulk Wholesale Orders?
            </h2>

            <p className="mt-2 text-sm text-red-100">
              Share your product requirements and our team will contact you
              with availability and pricing.
            </p>
          </div>

          <Link
            href={`/enquiry?category=${encodeURIComponent(
              categoryName || "Mens Wear"
            )}`}
            className="shrink-0 rounded-lg bg-white px-7 py-3 font-bold text-red-600 transition hover:bg-gray-100"
          >
            Send Enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
