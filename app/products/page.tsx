
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  getAllProducts,
  getProductsByCategory,
} from "@/lib/products";

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

  const allProducts = getAllProducts();

  const filteredProducts = category
    ? getProductsByCategory(category, subcategory || undefined)
    : allProducts;

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
              {filteredProducts.length} products available
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

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">
              👔
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              No Products Available
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              {category
                ? `Our ${heading} collection is being updated. Contact us for current stock and wholesale prices.`
                : "Our wholesale collection is being updated. Please contact us for current designs, availability and bulk pricing."}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/enquiry?category=${encodeURIComponent(
                  category || "Mens Wear"
                )}&subcategory=${encodeURIComponent(subcategory)}`}
                className="rounded-lg bg-red-600 px-7 py-3 font-bold text-white hover:bg-red-700"
              >
                Send Wholesale Enquiry
              </Link>

              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-800 hover:bg-gray-100"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
