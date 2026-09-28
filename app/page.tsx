
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const categories = [
  { name: "Shirts", slug: "shirts", description: "Formal, casual, printed & checks", icon: "👔" },
  { name: "T-Shirts", slug: "t-shirts", description: "Round neck, polo & oversized", icon: "👕" },
  { name: "Jeans", slug: "jeans", description: "Slim fit, regular & baggy", icon: "👖" },
{ name: "Trousers & Pants", slug: "trousers-pants", description: "Formal, chinos & cargo", icon: "🩳" },
  { name: "Ethnic Wear", slug: "ethnic-wear", description: "Kurtas & festive collections", icon: "🥻" },
  { name: "Winter Wear", slug: "winter-wear", description: "Jackets, hoodies & sweaters", icon: "🧥" },
  { name: "Sportswear", slug: "sportswear", description: "Track pants, lowers & shorts", icon: "🏃" },
  { name: "Suits & Blazers", slug: "suits-blazers", description: "Blazers, suits & waistcoats", icon: "🤵" },
  { name: "Innerwear", slug: "innerwear", description: "Men's innerwear collection", icon: "🩲" },
  { name: "Nightwear", slug: "nightwear", description: "Night suits & pajamas", icon: "🌙" },
  { name: "Accessories", slug: "accessories", description: "Belts, socks & accessories", icon: "🧦" },
];

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
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsQuery = query(
          collection(db, "products"),
          limit(100)
        );

        const snapshot = await getDocs(productsQuery);

        const productData = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Product[];

        setProducts(productData);
      } catch (error) {
        console.error("Homepage products error:", error);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="shrink-0">
            <h1 className="text-xl font-black tracking-tight text-red-700 sm:text-2xl">
              MAHAKAL A TO Z
            </h1>
            <p className="text-xs font-medium text-gray-500">
              MEN&apos;S WEAR WHOLESALE
            </p>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-red-700">Home</Link>
            <Link href="#categories" className="hover:text-red-700">Categories</Link>
            <Link href="#products" className="hover:text-red-700">Products</Link>
            <Link href="#about" className="hover:text-red-700">About Us</Link>
            <Link href="#enquiry" className="hover:text-red-700">Contact</Link>
          </nav>

          <Link
            href="/enquiry"
            className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
          >
            Enquire Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="mb-5 inline-block rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300">
              Wholesale Collection for Retailers
            </span>

            <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Men&apos;s Fashion.
              <span className="block text-red-500">
                Wholesale Prices.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-300 sm:text-lg">
              Explore our men&apos;s wear collection for your retail store.
              Browse products, share your requirements and get wholesale
              prices directly from our team.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#products"
                className="rounded-lg bg-red-700 px-6 py-3.5 font-bold text-white hover:bg-red-800"
              >
                Explore Products
              </Link>

              <Link
                href="/enquiry"
                className="rounded-lg border border-white/30 px-6 py-3.5 font-bold text-white hover:bg-white/10"
              >
                Get Wholesale Price
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-gray-300">
              <span>✓ Bulk Enquiries</span>
              <span>✓ Retailer Support</span>
              <span>✓ Direct Assistance</span>
            </div>
          </div>

          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-950 p-8">
            <div className="text-center">
              <div className="text-8xl">👔</div>
              <p className="mt-6 text-2xl font-black">
                MAHAKAL A TO Z
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Your Men&apos;s Wear Wholesale Partner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-16 sm:py-20"
      >
        <div className="mb-10 text-center">
          <p className="font-bold uppercase tracking-widest text-red-700">
            Explore Our Collection
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Men&apos;s Wear Categories
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Explore categories and discover products for your shop.
            Contact us for wholesale pricing and bulk requirements.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg sm:p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 text-4xl transition group-hover:bg-red-100">
                {category.icon}
              </div>

              <h3 className="mt-5 font-bold group-hover:text-red-700">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                {category.description}
              </p>

              <span className="mt-4 inline-block text-sm font-bold text-red-700">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Firestore Products */}
      <section
        id="products"
        className="bg-gray-50 px-4 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="font-bold uppercase tracking-widest text-red-700">
              Latest Collection
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Our Products
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Explore products available for wholesale and bulk enquiries.
            </p>
          </div>

          {loadingProducts ? (
            <div className="py-12 text-center text-gray-500">
              Products loading...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white px-5 py-12 text-center">
              <div className="text-5xl">👔</div>
              <h3 className="mt-4 text-xl font-bold">
                Products Coming Soon
              </h3>
              <p className="mt-2 text-gray-500">
                Our latest collection will be available here soon.
              </p>
              <Link
                href="/enquiry"
                className="mt-5 inline-block rounded-lg bg-red-700 px-6 py-3 font-bold text-white hover:bg-red-800"
              >
                Send an Enquiry
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        👔
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 font-bold">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        Wholesale Price
                      </p>
                      <p className="text-xl font-black text-gray-900">
                        ₹{Number(product.wholesalePrice || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Retail: ₹{Number(product.retailPrice || 0).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-2 text-xs font-medium text-gray-600">
                      {product.stock > 0
                        ? "In Stock"
                        : "Availability on enquiry"}
                    </p>

                    <Link
                      href={`/enquiry?product=${encodeURIComponent(product.name)}`}
                      className="mt-4 block rounded-lg bg-red-700 px-3 py-3 text-center text-sm font-bold text-white hover:bg-red-800"
                    >
                      Enquire on WhatsApp
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Wholesale CTA */}
      <section
        id="enquiry"
        className="bg-red-700 px-4 py-14 text-white sm:py-16"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">
              Looking for Wholesale Rates?
            </h2>
            <p className="mt-3 max-w-xl text-red-100">
              Tell us which products and quantities you need.
              Our team will contact you to discuss availability,
              pricing and dispatch.
            </p>
          </div>

          <Link
            href="/enquiry"
            className="shrink-0 rounded-lg bg-white px-7 py-4 font-bold text-red-700 hover:bg-red-50"
          >
            Submit Your Enquiry →
          </Link>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black">
            About Mahakal A To Z
          </h2>

          <p className="mt-5 leading-7 text-gray-600">
            Mahakal A To Z is focused on men&apos;s wear wholesale.
            We help retailers and shopkeepers explore our clothing
            collections and submit bulk purchase enquiries.
            Our team discusses product availability, wholesale
            rates and delivery directly with buyers.
          </p>

          <Link
            href="/enquiry"
            className="mt-6 inline-block rounded-lg bg-red-700 px-6 py-3 font-bold text-white hover:bg-red-800"
          >
            Contact Our Team
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row">
          <div>
            <h2 className="text-xl font-black text-red-500">
              MAHAKAL A TO Z
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Men&apos;s Wear Wholesale & Bulk Supply
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="#categories" className="hover:text-white">Categories</Link>
            <Link href="/enquiry" className="hover:text-white">Enquiry</Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Mahakal A To Z. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
