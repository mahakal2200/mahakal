
import Link from "next/link";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const inStock = product.available && product.stock > 0;
  const price = product.retailPrice;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      <Link
        href={`/products/${encodeURIComponent(product.slug)}`}
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
            <span className="text-6xl" aria-hidden="true">
              👔
            </span>
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

        {!inStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-gray-900/85 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
          {product.category}
        </p>

        <Link href={`/products/${encodeURIComponent(product.slug)}`}>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold text-gray-900 transition hover:text-red-600">
            {product.name}
          </h3>
        </Link>

        {product.subcategory && (
          <p className="mt-2 text-sm text-gray-500">
            {product.subcategory}
          </p>
        )}

        {/* Retail Price */}
        <div className="mt-4">
          {price > 0 ? (
            <p className="text-2xl font-extrabold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
              <span className="ml-1 text-xs font-medium text-gray-500">
                / piece
              </span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-600">
              Price currently unavailable
            </p>
          )}
        </div>

        {/* Sizes and Colours */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {product.sizes.length > 0 && (
            <p>
              <span className="font-semibold text-gray-800">
                Sizes:
              </span>{" "}
              {product.sizes.join(", ")}
            </p>
          )}

          {product.colors.length > 0 && (
            <p>
              <span className="font-semibold text-gray-800">
                Colours:
              </span>{" "}
              {product.colors.join(", ")}
            </p>
          )}
        </div>

        {/* Shopping Actions */}
        <div className="mt-5 flex flex-col gap-3">
          {inStock && price > 0 ? (
            <Link
              href={`/products/${encodeURIComponent(product.slug)}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <span aria-hidden="true">🛍️</span>
              View & Buy
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 text-sm font-bold text-gray-500"
            >
              {inStock ? "Price Unavailable" : "Currently Unavailable"}
            </button>
          )}

          <Link
            href={`/products/${encodeURIComponent(product.slug)}`}
            className="text-center text-sm font-semibold text-gray-700 transition hover:text-red-600"
          >
            View Product Details →
          </Link>
        </div>

        {/* Local Marketplace Benefits */}
        <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <p>Cash on Delivery available in serviceable areas</p>
          <p className="mt-1">Delivery across eligible areas of Ghazipur</p>
        </div>
      </div>
    </article>
  );
}
