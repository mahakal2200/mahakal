
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
  retailPrice: number;
  stock: number;
  available: boolean;
};

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      ).map((item) => item.trim())
    ),
  ];
}

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
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const productQuery = query(
          collection(db, "products"),
          where("slug", "==", slug),
          limit(1)
        );

        const snapshot = await getDocs(productQuery);

        if (cancelled) return;

        if (snapshot.empty) {
          setProduct(null);
          return;
        }

        const document = snapshot.docs[0];
        const data = document.data();

        const stockValue = Number(data.stock ?? 0);
        const stock =
          Number.isFinite(stockValue) && stockValue > 0
            ? Math.floor(stockValue)
            : 0;

        const priceValue = Number(data.retailPrice ?? 0);
        const retailPrice =
          Number.isFinite(priceValue) && priceValue > 0
            ? priceValue
            : 0;

        const images = stringArray(data.images);
        const primaryImage =
          stringValue(data.image) || images[0] || "";

        const available =
          data.available !== undefined
            ? data.available === true
            : stock > 0;

        const loadedProduct: ProductData = {
          id: document.id,
          name: stringValue(data.name) || "Clothing Product",
          slug: stringValue(data.slug) || document.id,
          category: stringValue(data.category),
          subcategory: stringValue(data.subcategory),
          description: stringValue(data.description),
          image: primaryImage,
          images: [
            ...new Set(
              [primaryImage, ...images].filter(Boolean)
            ),
          ],
          sizes: stringArray(data.sizes),
          colors: stringArray(data.colors),
          fabric: stringValue(data.fabric),
          retailPrice,
          stock,
          available,
        };

        setProduct(loadedProduct);
        setSelectedImage(primaryImage);
        setSelectedSize(loadedProduct.sizes[0] || "");
        setSelectedColor(loadedProduct.colors[0] || "");
        setQuantity(1);
      } catch (err) {
        console.error("Product details error:", err);

        if (!cancelled) {
          setError(
            "Product load nahi ho paaya. Internet check karke dobara try karein."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function handleAddToCart(goToCart = false) {
    if (!product) return;

    setMessage("");

    if (!product.available || product.stock < 1) {
      setMessage("Ye product abhi stock mein available nahi hai.");
      return;
    }

    if (product.retailPrice <= 0) {
      setMessage("Is product ki retail price abhi available nahi hai.");
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      setMessage("Please size select karein.");
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      setMessage("Please colour select karein.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock
    ) {
      setMessage(`Quantity 1 se ${product.stock} pieces ke beech honi chahiye.`);
      return;
    }

    setAdding(true);

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

    setAdding(false);
    setMessage(result.message);

    if (result.success && goToCart) {
      router.push("/cart");
    }
  }

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
            className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
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
          <div className="text-6xl">👕</div>
          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Product Not Available
          </h1>
          <p className="mt-3 text-gray-600">
            Ye product unavailable hai ya remove kar diya gaya hai.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const inStock = product.stock > 0;
  const canBuy = inStock && product.retailPrice > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-red-600"
          >
            {product.category || "Products"}
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div>
            <div className="overflow-hidden rounded-xl bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="aspect-[4/5] w-full object-contain"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-7xl text-gray-400">
                  👕
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                    className={`overflow-hidden rounded-lg border-2 ${
                      selectedImage === image
                        ? "border-red-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-20 w-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            {product.subcategory && (
              <p className="mt-2 text-sm text-gray-500">
                {product.subcategory}
              </p>
            )}

            <p className="mt-4 leading-7 text-gray-600">
              {product.description || "Product details aur available options neeche dekhein."}
            </p>

            <div className="mt-6 rounded-xl bg-red-50 p-5">
              <p className="text-sm font-semibold text-gray-600">
                Retail Price
              </p>
              <p className="mt-1 text-3xl font-extrabold text-red-600">
                {product.retailPrice > 0
                  ? money(product.retailPrice)
                  : "Price unavailable"}
              </p>
              {product.fabric && (
                <p className="mt-2 text-sm text-gray-600">
                  Fabric: {product.fabric}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-6">
              {product.sizes.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-bold text-gray-800">
                    Select Size
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`min-w-12 rounded-lg border px-4 py-2 font-semibold ${
                          selectedSize === size
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white text-gray-800 hover:border-red-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {product.colors.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-bold text-gray-800">
                    Select Colour
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={selectedColor === color}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                          selectedColor === color
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white text-gray-800 hover:border-red-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div>
                <label
                  htmlFor="product-quantity"
                  className="text-sm font-bold text-gray-800"
                >
                  Quantity
                </label>
                <div className="mt-3 flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-lg disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    id="product-quantity"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isInteger(value) && value >= 1) {
                        setQuantity(Math.min(value, Math.max(product.stock, 1)));
                      }
                    }}
                    className="w-16 border-x border-gray-300 py-2 text-center font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(product.stock, current + 1)
                      )
                    }
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 text-lg disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {inStock
                    ? `${product.stock} pieces in stock`
                    : "Currently out of stock"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {money(product.retailPrice * quantity)}
                </span>
              </div>

              {message && (
                <p
                  role="status"
                  className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                    message.includes("add ho gaya")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!canBuy || adding}
                className="mt-5 w-full rounded-xl border-2 border-red-600 px-6 py-4 font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={!canBuy || adding}
                className="mt-3 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Buy Now
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Delivery availability aur Cash on Delivery checkout ke dauran confirm honge.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
