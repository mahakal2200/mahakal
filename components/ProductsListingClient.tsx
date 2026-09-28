
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type Props = {
  category: string;
  subcategory: string;
};

type FirestoreProduct = {
  id: string;
  name?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  minimumOrder?: number;
  priceLabel?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  stock?: number;
  featured?: boolean;
  available?: boolean;
};

export default function ProductsListingClient({
  category,
  subcategory,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const productsQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(productsQuery);

        const firestoreProducts: FirestoreProduct[] =
          snapshot.docs.map((document) => {
            const data = document.data();

            return {
              id: document.id,
              name: data.name || "",
              slug: data.slug || document.id,
              category: data.category || "",
              subcategory: data.subcategory || "",
              description: data.description || "",
              image: data.image || "",
              images: Array.isArray(data.images)
                ? data.images
                : [],
              sizes: Array.isArray(data.sizes)
                ? data.sizes
                : [],
              colors: Array.isArray(data.colors)
                ? data.colors
                : [],
              fabric: data.fabric || "",
              minimumOrder: Number(data.minimumOrder || 0),
              priceLabel:
                data.priceLabel ||
                (data.wholesalePrice
                  ? `₹${data.wholesalePrice}`
                  : "Contact for wholesale price"),
              featured: Boolean(data.featured),
              available:
                data.available !== undefined
                  ? Boolean(data.available)
                  : Number(data.stock ?? 0) > 0,
              wholesalePrice: Number(data.wholesalePrice || 0),
              retailPrice: Number(data.retailPrice || 0),
              stock: Number(data.stock || 0),
            };
          });

        const normalizedProducts: Product[] =
  firestoreProducts.map((product) => {
    const wholesalePrice = Number(
      product.wholesalePrice ?? 0
    );

    const stock = Number(product.stock ?? 0);

    return {
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      description: product.description || "",

      image: product.image || "",
      images: Array.isArray(product.images)
        ? product.images.filter(
            (image): image is string =>
              typeof image === "string"
          )
        : [],

      sizes: Array.isArray(product.sizes)
        ? product.sizes.filter(
            (size): size is string =>
              typeof size === "string"
          )
        : [],

      colors: Array.isArray(product.colors)
        ? product.colors.filter(
            (color): color is string =>
              typeof color === "string"
          )
        : [],

      fabric: product.fabric || "",
      minimumOrder: Number(product.minimumOrder ?? 1),

      priceLabel:
        product.priceLabel ||
        (wholesalePrice > 0
          ? `₹${wholesalePrice} / piece`
          : "Contact for Price"),

      wholesalePrice,
      retailPrice: Number(product.retailPrice ?? 0),
      stock,

      featured: Boolean(product.featured),

      available:
        product.available !== undefined
          ? Boolean(product.available)
          : stock > 0,
    };
  });
        const filteredProducts = normalizedProducts.filter(
          (product) => {
            const categoryMatches = category
              ? product.category.toLowerCase() ===
                category.toLowerCase()
              : true;

            const subcategoryMatches = subcategory
              ? product.subcategory.toLowerCase() ===
                subcategory.toLowerCase()
              : true;

            return (
              categoryMatches &&
              subcategoryMatches &&
              product.available
            );
          }
        );

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError(
          "Products load nahi ho paaye. Please refresh karke dobara try karein."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [category, subcategory]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white px-5 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading wholesale products...
        </p>
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
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">
          👔
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          No Products Available
        </h3>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
          {category
            ? `Our ${subcategory || category} collection is being updated. Contact us for current stock and wholesale prices.`
            : "Our wholesale collection is being updated. Please contact us for current designs, availability and bulk pricing."}
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
