"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type CategoryProductsClientProps = {
  category: string;
};

export default function CategoryProductsClient({
  category,
}: CategoryProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const productsQuery = query(
          collection(db, "products"),
          where("category", "==", category)
        );

        const snapshot = await getDocs(productsQuery);

        const fetchedProducts: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          const wholesalePrice = Number(data.wholesalePrice ?? 0);
          const stock = Number(data.stock ?? 0);

          return {
            id: doc.id,
            name: String(data.name ?? ""),
            slug: String(data.slug ?? doc.id),
            category: String(data.category ?? category),
            subcategory: String(data.subcategory ?? ""),
            description: String(data.description ?? ""),
            image: String(
              data.image ??
                (Array.isArray(data.images) ? data.images[0] : "") ??
                ""
            ),
            images: Array.isArray(data.images)
              ? data.images.filter(
                  (image: unknown): image is string =>
                    typeof image === "string"
                )
              : [],
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            colors: Array.isArray(data.colors) ? data.colors : [],
            fabric: String(data.fabric ?? ""),
            minimumOrder: Number(data.minimumOrder ?? 1),
            priceLabel:
              data.priceLabel ??
              (wholesalePrice > 0
                ? `₹${wholesalePrice}`
                : "Contact for Price"),
            featured: Boolean(data.featured ?? false),
            available:
              data.available !== undefined
                ? Boolean(data.available)
                : stock > 0,
          };
        });

        const availableProducts = fetchedProducts.filter(
          (product) => product.available
        );

        if (isMounted) {
          setProducts(availableProducts);
        }
      } catch (err) {
        console.error("Category products fetch error:", err);

        if (isMounted) {
          setError(
            "Products load nahi ho paaye. Kripya page refresh karke dobara try karein."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
        <p className="font-semibold text-red-700">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
        <div className="mb-4 text-5xl">👔</div>

        <h3 className="text-xl font-bold text-gray-900">
          Products Coming Soon
        </h3>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
          Is category ke products abhi available nahi hain. Current designs,
          stock aur wholesale pricing ke liye humse directly contact karein.
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
