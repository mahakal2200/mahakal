
import Link from "next/link";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-gray-100"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
            <span className="text-6xl">👔</span>
            <span className="text-sm font-medium">
              Product Image Coming Soon
            </span>
          </div>
        )}

        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Featured
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
          {product.category}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold text-gray-900 transition hover:text-red-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-gray-500">
          {product.subcategory}
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {product.sizes.length > 0 && (
            <p>
              <span className="font-semibold text-gray-800">Sizes:</span>{" "}
              {product.sizes.join(", ")}
            </p>
          )}

          {product.colors.length > 0 && (
            <p>
              <span className="font-semibold text-gray-800">Colours:</span>{" "}
              {product.colors.join(", ")}
            </p>
          )}

          {product.minimumOrder > 0 && (
            <p>
              <span className="font-semibold text-gray-800">
                Minimum Order:
              </span>{" "}
              {product.minimumOrder} pieces
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href={`/enquiry?category=${encodeURIComponent(
              product.category
            )}&subcategory=${encodeURIComponent(
              product.name
            )}&product=${encodeURIComponent(product.slug)}`}
            className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Get Wholesale Price
          </Link>

          <Link
            href={`/products/${product.slug}`}
            className="text-center text-sm font-semibold text-gray-700 transition hover:text-red-600"
          >
            View Product Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
