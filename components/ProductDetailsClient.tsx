
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type ProductData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  fabric: string;
  minimumOrder: number;
  priceLabel: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  available: boolean;
};

export default function ProductDetailsClient({
  slug,
}: {
  slug: string;
}) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const productsRef = collection(db, "products");

        const productQuery = query(
          productsRef,
          where("slug", "==", slug),
          limit(1)
        );

        const snapshot = await getDocs(productQuery);

        if (snapshot.empty) {
          setProduct(null);
          return;
        }

        const document = snapshot.docs[0];
        const data = document.data();

        const wholesalePrice = Number(data.wholesalePrice || 0);
        const stock = Number(data.stock || 0);

        const images = Array.isArray(data.images)
          ? data.images.filter(
              (image: unknown): image is string =>
                typeof image === "string" && image.length > 0
            )
          : [];

        const image =
          typeof data.image === "string" && data.image
            ? data.image
            : images[0] || "";

        setProduct({
          id: document.id,
          name: data.name || "",
          slug: data.slug || document.id,
          category: data.category || "",
          subcategory: data.subcategory || "",
          description: data.description || "",
          image,
          images,
          sizes: Array.isArray(data.sizes) ? data.sizes : [],
          colors: Array.isArray(data.colors) ? data.colors : [],
          fabric: data.fabric || "",
          minimumOrder: Number(data.minimumOrder || 0),
          priceLabel:
            data.priceLabel ||
            (wholesalePrice > 0
              ? `₹${wholesalePrice}`
              : "Contact for Price"),
          wholesalePrice,
          retailPrice: Number(data.retailPrice || 0),
          stock,
          available:
            data.available !== undefined
              ? Boolean(data.available)
              : stock > 0,
        });
      } catch (err) {
        console.error("Product details error:", err);
        setError(
          "Product load nahi ho paaya. Please refresh karke dobara try karein."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="mt-4 text-gray-600">
            Loading product details...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center">
          <p className="font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-bold text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!product || !product.available) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">👔</div>
          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Product Not Found
          </h1>
          <p className="mt-3 text-gray-600">
            This product is unavailable or may have been removed.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Browse All Products
          </Link>
        </div>
      </main>
    );
  }

  const enquiryUrl =
    `/enquiry?category=${encodeURIComponent(product.category)}` +
    `&subcategory=${encodeURIComponent(product.name)}` +
    `&product=${encodeURIComponent(product.slug)}`;

  const whatsappMessage =
    `Hello, I want to enquire about ${product.name}. ` +
    `Category: ${product.category}. ` +
    `Please share wholesale price and availability.`;

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
            href={`/products?category=${encodeURIComponent(
              product.category
            )}`}
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
              {product.description ||
                "Contact us for product details and wholesale availability."}
            </p>

            <div className="mt-8 space-y-5 border-y border-gray-200 py-6">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Product Category
                </p>
                <p className="mt-1 font-bold text-gray-900">
                  {product.subcategory || product.category}
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

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Stock Status
                </p>
                <p className="mt-1 font-bold text-gray-900">
                  {product.stock > 0
                    ? `${product.stock} pieces available`
                    : "Confirm current stock"}
                </p>
              </div>
            </div>

            {/* Wholesale Price */}
            <div className="mt-6 rounded-xl bg-red-50 p-5">
              <p className="text-sm font-semibold text-gray-700">
                Wholesale Price
              </p>

              <p className="mt-2 text-2xl font-extrabold text-red-600">
                {product.priceLabel}
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
                whatsappMessage
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
