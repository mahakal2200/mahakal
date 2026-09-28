
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/products";

const categories: Record<
  string,
  {
    name: string;
    description: string;
    subcategories: string[];
  }
> = {
  shirts: {
    name: "Shirts",
    description: "Wholesale formal, casual and party wear shirts for men.",
    subcategories: [
      "Formal Shirts",
      "Casual Shirts",
      "Printed Shirts",
      "Linen Shirts",
      "Denim Shirts",
      "Full Sleeve Shirts",
      "Half Sleeve Shirts",
    ],
  },

  "t-shirts": {
    name: "T-Shirts",
    description: "Explore wholesale men's T-shirts in different styles.",
    subcategories: [
      "Round Neck T-Shirts",
      "Polo T-Shirts",
      "Oversized T-Shirts",
      "Printed T-Shirts",
      "Plain T-Shirts",
      "Sports T-Shirts",
    ],
  },

  jeans: {
    name: "Jeans",
    description: "Wholesale men's denim jeans in various fits and washes.",
    subcategories: [
      "Slim Fit Jeans",
      "Regular Fit Jeans",
      "Baggy Jeans",
      "Straight Fit Jeans",
      "Cargo Jeans",
      "Ripped Jeans",
    ],
  },

  "trousers-pants": {
    name: "Trousers & Pants",
    description: "Wholesale formal and casual trousers for men's wear shops.",
    subcategories: [
      "Formal Trousers",
      "Casual Pants",
      "Cargo Pants",
      "Chinos",
      "Track Pants",
      "Cotton Trousers",
    ],
  },

  "ethnic-wear": {
    name: "Ethnic Wear",
    description: "Wholesale traditional and ethnic clothing for men.",
    subcategories: [
      "Kurtas",
      "Kurta Pajama Sets",
      "Nehru Jackets",
      "Pathani Suits",
      "Sherwanis",
    ],
  },

  "winter-wear": {
    name: "Winter Wear",
    description: "Wholesale men's winter clothing and seasonal collections.",
    subcategories: [
      "Jackets",
      "Hoodies",
      "Sweatshirts",
      "Sweaters",
      "Thermals",
    ],
  },

  sportswear: {
    name: "Sportswear",
    description: "Wholesale sportswear and activewear for men.",
    subcategories: [
      "Track Suits",
      "Sports T-Shirts",
      "Gym Wear",
      "Track Pants",
      "Sports Shorts",
    ],
  },

  "suits-blazers": {
    name: "Suits & Blazers",
    description: "Wholesale men's formal suits and blazers.",
    subcategories: [
      "Blazers",
      "Formal Suits",
      "Waistcoats",
      "Wedding Suits",
    ],
  },

  innerwear: {
    name: "Innerwear",
    description: "Wholesale men's innerwear and essential clothing.",
    subcategories: [
      "Vests",
      "Briefs",
      "Boxers",
      "Trunks",
    ],
  },

  nightwear: {
    name: "Nightwear",
    description: "Wholesale men's nightwear and comfortable sleepwear.",
    subcategories: [
      "Night Suits",
      "Night Shorts",
      "Pyjamas",
    ],
  },

  accessories: {
    name: "Accessories",
    description: "Wholesale men's fashion accessories.",
    subcategories: [
      "Belts",
      "Wallets",
      "Caps",
      "Socks",
      "Ties",
    ],
  },
};

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = categories[slug];

  if (!category) {
    return {
      title: "Category Not Found | Mahakal A To Z",
    };
  }

  return {
    title: `${category.name} Wholesale | Mahakal A To Z`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = categories[slug];

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.name);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-black px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-gray-300 hover:text-white"
          >
            ← Back to Home
          </Link>

          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            Mahakal A To Z Wholesale
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            Men's {category.name}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-300">
            {category.description}
          </p>

          <Link
            href={`/enquiry?category=${encodeURIComponent(category.name)}`}
            className="mt-7 inline-flex rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Enquire for Wholesale Rates
          </Link>
        </div>
      </section>

      {/* Subcategories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Browse {category.name} Types
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Select a type to explore the collection.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {category.subcategories.map((subcategory) => (
            <Link
              key={subcategory}
              href={`/products?category=${encodeURIComponent(
                category.name
              )}&subcategory=${encodeURIComponent(subcategory)}`}
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-800 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
            >
              {subcategory}
              <span className="ml-2 text-red-500">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Actual Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Available Products
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {categoryProducts.length} products available
            </p>
          </div>

          <Link
            href={`/enquiry?category=${encodeURIComponent(category.name)}`}
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Bulk Order Enquiry
          </Link>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
            <div className="mb-4 text-5xl">👔</div>

            <h3 className="text-xl font-bold text-gray-900">
              Products Coming Soon
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              Our {category.name.toLowerCase()} collection is being updated.
              Contact us directly for current designs, stock and wholesale
              pricing.
            </p>

            <Link
              href={`/enquiry?category=${encodeURIComponent(category.name)}`}
              className="mt-6 inline-flex rounded-lg bg-red-600 px-7 py-3 font-bold text-white hover:bg-red-700"
            >
              Enquire Now
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
