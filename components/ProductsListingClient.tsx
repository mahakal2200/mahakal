
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import {
  normalizeProduct,
  type Product,
} from "@/lib/products";

type Props = {
  category: string;
  subcategory: string;
};

export default function ProductsListingClient({
  category,
  subcategory,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(productsQuery);

      const normalizedProducts: Product[] = snapshot.docs.map(
        (document) =>
          normalizeProduct(
            document.id,
            document.data() as Record<string, unknown>
          )
      );

      const filteredProducts = normalizedProducts.filter(
        (product) => {
          const categoryMatches = category
            ? product.category.trim().toLowerCase() ===
              category.trim().toLowerCase()
            : true;

          const subcategoryMatches = subcategory
            ? product.subcategory.trim().toLowerCase() ===
              subcategory.trim().toLowerCase()
            : true;

          return (
            categoryMatches &&
            subcategoryMatches &&
            product.available &&
            product.stock > 0
          );
        }
      );

      setProducts(filteredProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(
        "Products load nahi ho paaye. Internet connection check karke dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  }, [category, subcategory]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts, retryCount]);

  if (loading) {
    return (
      <div
        className="rounded-2xl bg-white px-5 py-16 text-center"
        aria-live="polite"
      >
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading clothing products...
        </p>
      </div>
    );
  }

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

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">
          👔
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          No Products Available
        </h3>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
          {category
            ? `Abhi ${subcategory || category} mein koi available product nahi hai. Kripya baad mein dobara check karein.`
            : "Abhi koi clothing product available nahi hai. Kripya baad mein dobara check karein."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
