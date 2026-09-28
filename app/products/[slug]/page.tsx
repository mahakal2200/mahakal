
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
} from "@/lib/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Mahakal A To Z",
    };
  }

  return {
    title: `${product.name} | Mahakal A To Z`,
    description: product.description,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const enquiryUrl =
    `/enquiry?category=${encodeURIComponent(product.category)}` +
    `&subcategory=${encodeURIComponent(product.name)}` +
    `&product=${encodeURIComponent(product.slug)}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <span>/</span>

          <Link
            href={`/category/${product.category
              .toLowerCase()
              .replace(/ & /g, "-")
              .replace(/\s+/g, "-")}`}
            className="hover:text-red-600"
          >
            {product.category}
          </Link>

          <span>/</span>

          <span className="font-semibold text-gray-900">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          {/* Image */}
          <div className="overflow-hidden rounded-xl bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 text-gray-400">
                <span className="text-8xl">👔</span>

                <p className="text-sm font-medium">
                  Product Image Coming Soon
                </p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-8 space-y-5 border-y border-gray-200 py-6">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Product Category
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {product.subcategory}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Available Sizes
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.length > 0 ? (
                    product.sizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Confirm with us
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Available Colours
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {product.colors.length > 0
                    ? product.colors.join(", ")
                    : "Confirm with us"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Fabric
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {product.fabric || "Confirm with us"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Minimum Order Quantity
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {product.minimumOrder > 0
                    ? `${product.minimumOrder} pieces`
                    : "Contact us"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-red-50 p-5">
              <p className="text-sm font-semibold text-gray-700">
                Wholesale Price
              </p>

              <p className="mt-2 text-2xl font-extrabold text-red-600">
                {product.priceLabel || "Contact for Price"}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Contact us for current stock, bulk pricing and shipping
                details.
              </p>
            </div>

            <Link
              href={enquiryUrl}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-red-600 px-6 py-4 text-center font-bold text-white transition hover:bg-red-700"
            >
              Enquire About This Product
            </Link>

            <a
              href={`https://wa.me/919219495647?text=${encodeURIComponent(
                `Hello, I want to enquire about ${product.name}. Category: ${product.category}. Please share wholesale price and availability.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700"
            >
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
