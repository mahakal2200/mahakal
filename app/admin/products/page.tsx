
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

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
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
  description: "",
  wholesalePrice: "",
  retailPrice: "",
  stock: "",
};

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

  async function loadProducts() {
    setLoadingProducts(true);
    setError("");

    try {
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(productsQuery);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Product[];

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

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setImageFile(null);
    setEditingId(null);
    setOldImage("");
    const input = document.getElementById(
      "product-image"
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("कृपया केवल image file चुनें।");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image का size 5 MB से कम होना चाहिए।");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imageRef = ref(
      storage,
      `products/${Date.now()}-${safeName}`
    );

    await uploadBytes(imageRef, file, {
      contentType: file.type,
    });

    return await getDownloadURL(imageRef);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorized || loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const name = form.name.trim();
      const category = form.category.trim();

      const wholesalePrice = Number(form.wholesalePrice);
      const retailPrice = Number(form.retailPrice);
      const stock = Number(form.stock);

      if (!name || !category) {
        throw new Error("Product name और category जरूरी हैं।");
      }

      if (
        !Number.isFinite(wholesalePrice) ||
        !Number.isFinite(retailPrice) ||
        !Number.isFinite(stock) ||
        wholesalePrice < 0 ||
        retailPrice < 0 ||
        stock < 0
      ) {
        throw new Error("Price और stock की सही value दर्ज करें।");
      }

      let image = oldImage;

      if (imageFile) {
        image = await uploadImage(imageFile);
      }

      if (!image) {
        throw new Error("Product की image upload करना जरूरी है।");
      }

      const productData = {
        name,
        slug: makeSlug(form.slug || name),
        category,
        description: form.description.trim(),
        wholesalePrice,
        retailPrice,
        stock,
        image,
        images: [image],
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);

        if (imageFile && oldImage) {
          try {
            await deleteObject(ref(storage, oldImage));
          } catch (deleteError) {
            console.warn("Old image cleanup failed", deleteError);
          }
        }

        setMessage("Product successfully update हो गया।");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });

        setMessage("नया product successfully add हो गया।");
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

  function startEdit(product: Product) {
    setEditingId(product.id);
    setOldImage(product.image || "");

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "",
      description: product.description || "",
      wholesalePrice: String(product.wholesalePrice ?? ""),
      retailPrice: String(product.retailPrice ?? ""),
      stock: String(product.stock ?? ""),
    });

    setImageFile(null);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(product: Product) {
    if (!authorized) return;

    const confirmed = window.confirm(
      `क्या आप "${product.name}" को permanently delete करना चाहते हैं?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteDoc(doc(db, "products", product.id));

      if (product.image) {
        try {
          await deleteObject(ref(storage, product.image));
        } catch (imageError) {
          console.warn("Image deletion failed", imageError);
        }
      }

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      if (editingId === product.id) {
        resetForm();
      }

      setMessage("Product delete हो गया।");
    } catch (err) {
      console.error(err);
      setError("Product delete नहीं हुआ। Firebase Rules जाँचें।");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Admin access जाँच रहे हैं...</p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
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
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">In Stock</p>
            <p className="mt-2 text-3xl font-bold">
              {products.filter((p) => p.stock > 0).length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="mt-2 text-3xl font-bold">
              {products.filter((p) => p.stock <= 0).length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 sm:p-8">
          <h2 className="mb-6 text-xl font-bold">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          {message && (
            <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Men's Cotton Shirt"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="mens-cotton-shirt"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>
                <input
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="Men's Wear"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Wholesale Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wholesalePrice}
                  onChange={(e) =>
                    updateField("wholesalePrice", e.target.value)
                  }
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Retail Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.retailPrice}
                  onChange={(e) =>
                    updateField("retailPrice", e.target.value)
                  }
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                rows={4}
                placeholder="Product details, fabric, sizes, colors..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Image *
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] || null)
                }
                className="w-full rounded-lg border p-3"
              />

              {oldImage && !imageFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Existing image saved. नई image चुनना optional है।
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG या WebP. Maximum 5 MB.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
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
                  className="rounded-lg border px-6 py-3 font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">All Products</h2>

            <button
              onClick={loadProducts}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

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
                  className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
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

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{product.name}</h3>

                    <p className="text-sm text-gray-500">
                      {product.category}
                    </p>

                    <p className="mt-2 text-sm">
                      Wholesale: ₹{product.wholesalePrice} | Retail: ₹
                      {product.retailPrice}
                    </p>

                    <p className="mt-1 text-sm">
                      Stock: {product.stock}
                    </p>
                  </div>

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
