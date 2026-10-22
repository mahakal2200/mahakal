
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addToCart } from "@/lib/cart";

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

function money(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductDetailsClient({
  slug,
}: {
  slug: string;
}) {
  const router = useRouter();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState(false);

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

        const loadedProduct: ProductData = {
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
              ? money(wholesalePrice)
              : "Contact for Price"),
          wholesalePrice,
          retailPrice: Number(data.retailPrice || 0),
          stock,
          available:
            data.available !== undefined
              ? Boolean(data.available)
              : stock > 0,
        };

        setProduct(loadedProduct);
        setSelectedSize(loadedProduct.sizes[0] || "");
        setSelectedColor(loadedProduct.colors[0] || "");
      } catch (err) {
        console.error("Product details error:", err);
        setError(
          "Product load nahi ho paaya. Refresh karke dobara try karein."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  function handleAddToCart(goToCart: boolean) {
    if (!product) return;

    setCartMessage("");
    setCartError(false);

    if (product.retailPrice <= 0) {
      setCartError(true);
      setCartMessage(
        "Is product ki retail price available nahi hai. Please wholesale enquiry karein."
      );
      return;
    }

    if (product.stock < 1) {
      setCartError(true);
      setCartMessage("Yeh product abhi out of stock hai.");
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      setCartError(true);
      setCartMessage("Please size select karein.");
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      setCartError(true);
      setCartMessage("Please colour select karein.");
      return;
    }

    const result = addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPrice: product.retailPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: product.stock,
    });

    if (!result.success) {
      setCartError(true);
      setCartMessage(result.message);
      return;
    }

    if (goToCart) {
      router.push("/cart");
      return;
    }

    setCartMessage("Product cart mein add ho gaya.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </main>
    );
  }

  if (error || !product || !product.available) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {error ? "Product Load Error" : "Product Not Available"}
          </h1>
          <p className="mt-3 text-gray-600">
            {error || "Yeh product abhi available nahi hai."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-bold text-white"
          >
            Retry
          </button>
          <div>
            <Link
              href="/products"
              className="mt-4 inline-block font-semibold text-red-600"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const enquiryUrl =
    `/enquiry?category=${encodeURIComponent(product.category)}` +
    `&subcategory=${encodeURIComponent(
      product.subcategory || product.category
    )}` +
    `&product=${encodeURIComponent(product.name)}` +
    `&slug=${encodeURIComponent(product.slug)}`;

  const whatsappMessage =
    `Hello, I want to enquire about this product.\n\n` +
    `Product: ${product.name}\n` +
    `Category: ${product.category}\n` +
    `Wholesale Price: ${product.priceLabel}\n` +
    `Minimum Order: ${
      product.minimumOrder > 0
        ? `${product.minimumOrder} pieces`
        : "Please confirm"
    }\n\nPlease share bulk pricing and delivery details.`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
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

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="overflow-hidden rounded-xl bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-7xl">
                👕
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              {product.description || "Product details ke liye contact karein."}
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-500">
                Retail Price
              </p>
              <p className="mt-1 text-3xl font-extrabold text-gray-900">
                {product.retailPrice > 0
                  ? money(product.retailPrice)
                  : "Price unavailable"}
              </p>
              {product.stock > 0 ? (
                <p className="mt-2 text-sm font-medium text-green-700">
                  In stock · {product.stock} pieces
                </p>
              ) : (
                <p className="mt-2 text-sm font-medium text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            {product.sizes.length > 0 && (
              <div className="mt-6">
                <label
                  htmlFor="product-size"
                  className="block text-sm font-bold text-gray-800"
                >
                  Select Size
                </label>
                <select
                  id="product-size"
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="mt-4">
                <label
                  htmlFor="product-color"
                  className="block text-sm font-bold text-gray-800"
                >
                  Select Colour
                </label>
                <select
                  id="product-color"
                  value={selectedColor}
                  onChange={(event) => setSelectedColor(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  {product.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="product-quantity"
                className="block text-sm font-bold text-gray-800"
              >
                Quantity
              </label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-11 w-11 rounded-lg border border-gray-300 text-xl font-bold"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  id="product-quantity"
                  type="number"
                  min={1}
                  max={Math.max(1, product.stock)}
                  value={quantity}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isInteger(value) && value >= 1) {
                      setQuantity(Math.min(value, Math.max(1, product.stock)));
                    }
                  }}
                  className="h-11 w-20 rounded-lg border border-gray-300 text-center"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(Math.max(1, product.stock), current + 1)
                    )
                  }
                  className="h-11 w-11 rounded-lg border border-gray-300 text-xl font-bold"
                  disabled={quantity >= product.stock || product.stock < 1}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={product.stock < 1 || product.retailPrice <= 0}
                className="w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={product.stock < 1 || product.retailPrice <= 0}
                className="w-full rounded-xl bg-gray-900 px-5 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Buy Now
              </button>
            </div>

            {cartMessage && (
              <p
                role={cartError ? "alert" : "status"}
                className={`mt-4 rounded-lg p-3 text-sm ${
                  cartError
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {cartMessage}
              </p>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm font-semibold text-gray-500">
                Wholesale Price
              </p>
              <p className="mt-1 text-2xl font-extrabold text-red-600">
                {product.priceLabel}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Bulk orders aur wholesale rates ke liye enquiry karein.
              </p>

              <Link
                href={enquiryUrl}
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-red-600 px-6 py-4 text-center font-bold text-red-600 transition hover:bg-red-50"
              >
                Wholesale Enquiry
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
        </div>
      </section>
    </main>
  );
}
