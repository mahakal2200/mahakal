
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import {
  normalizeProduct,
  type Product,
} from "@/lib/products";

type CategoryProductsClientProps = {
  category: string;
};

export default function CategoryProductsClient({
  category,
}: CategoryProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const productsQuery = query(
        collection(db, "products"),
        where("category", "==", category)
      );

      const snapshot = await getDocs(productsQuery);

      const fetchedProducts: Product[] = snapshot.docs.map(
        (document) =>
          normalizeProduct(
            document.id,
            document.data() as Record<string, unknown>
          )
      );

      const availableProducts = fetchedProducts.filter(
        (product) => product.available && product.stock > 0
      );

      setProducts(availableProducts);
    } catch (err) {
      console.error("Category products fetch error:", err);

      setError(
        "Products load nahi ho paaye. Internet connection check karke dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts, retryCount]);

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="Loading products"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border bg-white"
          >
            <div className="aspect-[4/5] bg-gray-200" />

            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
        <p className="font-semibold text-red-700">{error}</p>

        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty category
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
        <div className="mb-4 text-5xl">👔</div>

        <h3 className="text-xl font-bold text-gray-900">
          Products Coming Soon
        </h3>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
          Is category mein abhi koi clothing product
          available nahi hai. Kripya baad mein dobara
          check karein.
        </p>
      </div>
    );
  }

  // Product grid
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
