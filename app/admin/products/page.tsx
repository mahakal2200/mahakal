
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

import { auth, db, storage } from "@/lib/firebase";

const ADMIN_UID = "krycYafGxWcyghoeL4qIcvZAJjC3";

/* =========================================
   CATEGORY AND SUBCATEGORY OPTIONS
========================================= */

const CATEGORY_OPTIONS: Record<string, string[]> = {
  "Shirts": [
    "Formal Shirts",
    "Casual Shirts",
    "Printed Shirts",
    "Linen Shirts",
    "Denim Shirts",
    "Full Sleeve Shirts",
    "Half Sleeve Shirts",
  ],

  "T-Shirts": [
    "Round Neck T-Shirts",
    "Polo T-Shirts",
    "Oversized T-Shirts",
    "Printed T-Shirts",
    "Plain T-Shirts",
    "Sports T-Shirts",
  ],

  "Jeans": [
    "Slim Fit Jeans",
    "Regular Fit Jeans",
    "Baggy Jeans",
    "Straight Fit Jeans",
    "Cargo Jeans",
    "Ripped Jeans",
  ],

  "Trousers & Pants": [
    "Formal Trousers",
    "Casual Pants",
    "Cargo Pants",
    "Chinos",
    "Track Pants",
    "Cotton Trousers",
  ],

  "Ethnic Wear": [
    "Kurtas",
    "Kurta Pajama Sets",
    "Nehru Jackets",
    "Pathani Suits",
    "Sherwanis",
  ],

  "Winter Wear": [
    "Jackets",
    "Hoodies",
    "Sweatshirts",
    "Sweaters",
    "Thermals",
  ],

  "Sportswear": [
    "Track Suits",
    "Sports T-Shirts",
    "Gym Wear",
    "Track Pants",
    "Sports Shorts",
  ],

  "Suits & Blazers": [
    "Blazers",
    "Formal Suits",
    "Waistcoats",
    "Wedding Suits",
  ],

  "Innerwear": [
    "Vests",
    "Briefs",
    "Boxers",
    "Trunks",
  ],

  "Nightwear": [
    "Night Suits",
    "Night Shorts",
    "Pyjamas",
  ],

  "Accessories": [
    "Belts",
    "Wallets",
    "Caps",
    "Socks",
    "Ties",
  ],
};

/* =========================================
   TYPES
========================================= */

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  image: string;
  images?: string[];
  createdAt?: unknown;
};

const initialForm = {
  name: "",
  slug: "",
  category: "",
  subcategory: "",
  description: "",
  wholesalePrice: "",
  retailPrice: "",
  stock: "",
};

/* =========================================
   ADMIN PRODUCTS PAGE
========================================= */

export default function AdminProductsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initialForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================
     AUTHENTICATION
  ========================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        setChecking(false);
        return;
      }

      if (user.uid !== ADMIN_UID) {
        await signOut(auth);
        router.replace("/admin/login");
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);

      await loadProducts();
    });

    return () => unsubscribe();
  }, [router]);

  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  async function loadProducts() {
    setLoadingProducts(true);
    setError("");

    try {
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(productsQuery);

      const data = snapshot.docs.map((item) => {
        const productData = item.data();

        return {
          id: item.id,
          ...productData,
        };
      }) as Product[];

      setProducts(data);
    } catch (err) {
      console.error(err);

      setError(
        "Products load नहीं हुए। Firestore Rules और products collection जाँचें।"
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  /* =========================================
     SLUG GENERATOR
  ========================================= */

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* =========================================
     FORM FIELD HANDLER
  ========================================= */

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =========================================
     CATEGORY HANDLER
  ========================================= */

  function handleCategoryChange(category: string) {
    setForm((previous) => ({
      ...previous,
      category,
      subcategory: "",
    }));
  }

  /* =========================================
     RESET FORM
  ========================================= */

  function resetForm() {
    setForm(initialForm);

    setImageFile(null);
    setEditingId(null);
    setOldImage("");

    const input = document.getElementById(
      "product-image"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /* =========================================
     IMAGE UPLOAD
  ========================================= */

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("कृपया केवल image file चुनें।");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image का size 5 MB से कम होना चाहिए।");
    }

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const imageRef = ref(
      storage,
      `products/${Date.now()}-${safeName}`
    );

    await uploadBytes(imageRef, file, {
      contentType: file.type,
    });

    return await getDownloadURL(imageRef);
  }

  /* =========================================
     ADD / UPDATE PRODUCT
  ========================================= */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!authorized || loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const name = form.name.trim();
      const category = form.category.trim();
      const subcategory = form.subcategory.trim();

      const wholesalePrice = Number(form.wholesalePrice);
      const retailPrice = Number(form.retailPrice);
      const stock = Number(form.stock);

      if (!name || !category || !subcategory) {
        throw new Error(
          "Product name, category और subcategory जरूरी हैं।"
        );
      }

      if (!CATEGORY_OPTIONS[category]) {
        throw new Error("कृपया valid category चुनें।");
      }

      if (
        !CATEGORY_OPTIONS[category].includes(subcategory)
      ) {
        throw new Error(
          "कृपया चुनी गई category की सही subcategory चुनें।"
        );
      }

      if (
        !Number.isFinite(wholesalePrice) ||
        !Number.isFinite(retailPrice) ||
        !Number.isFinite(stock) ||
        wholesalePrice < 0 ||
        retailPrice < 0 ||
        stock < 0
      ) {
        throw new Error(
          "Price और stock की सही value दर्ज करें।"
        );
      }

      if (!Number.isInteger(stock)) {
        throw new Error(
          "Stock quantity पूर्ण संख्या में दर्ज करें।"
        );
      }

      let image = oldImage;

      if (imageFile) {
        image = await uploadImage(imageFile);
      }

      if (!image) {
        throw new Error(
          "Product की image upload करना जरूरी है।"
        );
      }

      const productData = {
        name,

        slug: makeSlug(form.slug || name),

        category,
        subcategory,

        description: form.description.trim(),

        wholesalePrice,
        retailPrice,
        stock,

        image,
        images: [image],

        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "products", editingId),
          productData
        );

        if (imageFile && oldImage) {
          try {
            await deleteObject(
              ref(storage, oldImage)
            );
          } catch (deleteError) {
            console.warn(
              "Old image cleanup failed",
              deleteError
            );
          }
        }

        setMessage(
          "Product successfully update हो गया।"
        );
      } else {
        await addDoc(
          collection(db, "products"),
          {
            ...productData,
            createdAt: serverTimestamp(),
          }
        );

        setMessage(
          "नया product successfully add हो गया।"
        );
      }

      resetForm();

      await loadProducts();
    } catch (err: unknown) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Product save नहीं हुआ। Firebase Rules जाँचें।"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     EDIT PRODUCT
  ========================================= */

  function startEdit(product: Product) {
    setEditingId(product.id);

    setOldImage(product.image || "");

    const category = product.category || "";

    const existingSubcategory = product.subcategory || "";

    setForm({
      name: product.name || "",
      slug: product.slug || "",

      category,

      subcategory: existingSubcategory,

      description: product.description || "",

      wholesalePrice: String(
        product.wholesalePrice ?? ""
      ),

      retailPrice: String(
        product.retailPrice ?? ""
      ),

      stock: String(product.stock ?? ""),
    });

    setImageFile(null);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================
     DELETE PRODUCT
  ========================================= */

  async function handleDelete(product: Product) {
    if (!authorized) return;

    const confirmed = window.confirm(
      `क्या आप "${product.name}" को permanently delete करना चाहते हैं?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteDoc(
        doc(db, "products", product.id)
      );

      if (product.image) {
        try {
          await deleteObject(
            ref(storage, product.image)
          );
        } catch (imageError) {
          console.warn(
            "Image deletion failed",
            imageError
          );
        }
      }

      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id
        )
      );

      if (editingId === product.id) {
        resetForm();
      }

      setMessage("Product delete हो गया।");
    } catch (err) {
      console.error(err);

      setError(
        "Product delete नहीं हुआ। Firebase Rules जाँचें।"
      );
    }
  }

  /* =========================================
     LOGOUT
  ========================================= */

  async function handleLogout() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  /* =========================================
     LOADING SCREEN
  ========================================= */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Admin access जाँच रहे हैं...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Mahakal A To Z
            </h1>

            <p className="text-sm text-gray-500">
              Admin Product Management
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">

        {/* =====================================
            DASHBOARD STATS
        ===================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              In Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                products.filter(
                  (p) => p.stock > 0
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {
                products.filter(
                  (p) => p.stock <= 0
                ).length
              }
            </p>
          </div>

        </section>

        {/* =====================================
            ADD / EDIT PRODUCT FORM
        ===================================== */}

        <section className="rounded-2xl border bg-white p-5 sm:p-8">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <h2 className="text-xl font-bold">
              {editingId
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            {editingId && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Editing Product
              </span>
            )}

          </div>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* PRODUCT NAME AND SLUG */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Name *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Men's Cotton Shirt"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    updateField("slug", e.target.value)
                  }
                  placeholder="mens-cotton-shirt"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  खाली छोड़ने पर product name से slug बनेगा।
                </p>
              </div>

            </div>

            {/* CATEGORY AND SUBCATEGORY */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* MAIN CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Main Category *
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="">
                    Select Main Category
                  </option>

                  {Object.keys(CATEGORY_OPTIONS).map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Product की main category चुनें।
                </p>
              </div>

              {/* SUBCATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subcategory *
                </label>

                <select
                  value={form.subcategory}
                  onChange={(e) =>
                    updateField(
                      "subcategory",
                      e.target.value
                    )
                  }
                  required
                  disabled={!form.category}
                  className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {form.category
                      ? "Select Subcategory"
                      : "पहले Main Category चुनें"}
                  </option>

                  {(CATEGORY_OPTIONS[form.category] || []).map(
                    (subcategory) => (
                      <option
                        key={subcategory}
                        value={subcategory}
                      >
                        {subcategory}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Subcategory main category के अनुसार बदलेगी।
                </p>
              </div>

            </div>

            {/* PRICES AND STOCK */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Wholesale Price (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wholesalePrice}
                  onChange={(e) =>
                    updateField(
                      "wholesalePrice",
                      e.target.value
                    )
                  }
                  placeholder="250"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Retail Price (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.retailPrice}
                  onChange={(e) =>
                    updateField(
                      "retailPrice",
                      e.target.value
                    )
                  }
                  placeholder="499"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stock Quantity *
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) =>
                    updateField("stock", e.target.value)
                  }
                  placeholder="100"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                rows={5}
                placeholder="Product details, fabric, sizes, colors, minimum order quantity..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* PRODUCT IMAGE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Image *
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full rounded-lg border bg-white p-3"
              />

              {oldImage && !imageFile && (
                <div className="mt-3 flex items-center gap-3">

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={oldImage}
                    alt="Current product"
                    className="h-20 w-20 rounded-lg border object-cover"
                  />

                  <p className="text-sm text-gray-500">
                    Existing image saved. नई image चुनना optional है।
                  </p>

                </div>
              )}

              {imageFile && (
                <p className="mt-2 text-sm text-green-700">
                  Selected: {imageFile.name}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG या WebP. Maximum 5 MB.
              </p>
            </div>

            {/* FORM BUTTONS */}

            <div className="flex flex-wrap gap-3 border-t pt-5">

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="rounded-lg border px-6 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        </section>

        {/* =====================================
            ALL PRODUCTS
        ===================================== */}

        <section className="rounded-2xl border bg-white p-5 sm:p-8">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold">
                All Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                सभी products और उनकी categories यहाँ दिखाई देंगी।
              </p>
            </div>

            <button
              onClick={loadProducts}
              disabled={loadingProducts}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingProducts ? "Loading..." : "Refresh"}
            </button>

          </div>

          {/* LOADING */}

          {loadingProducts ? (
            <p className="py-10 text-center text-gray-500">
              Products loading...
            </p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              अभी कोई product नहीं है। ऊपर से पहला product add करें।
            </p>
          ) : (

            <div className="space-y-4">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 transition hover:shadow-sm sm:flex-row sm:items-center"
                >

                  {/* IMAGE */}

                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold text-gray-900">
                      {product.name}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {product.category || "Uncategorized"}
                      </span>

                      {product.subcategory && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                          {product.subcategory}
                        </span>
                      )}

                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Wholesale: ₹{product.wholesalePrice}
                      {" | "}
                      Retail: ₹{product.retailPrice}
                    </p>

                    <p className="mt-1 text-sm">
                      Stock:{" "}
                      <span
                        className={
                          product.stock > 0
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </p>

                    {product.slug && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        Slug: {product.slug}
                      </p>
                    )}

                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="flex shrink-0 gap-2">

                    <button
                      onClick={() => startEdit(product)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
