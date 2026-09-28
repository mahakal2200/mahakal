
import Link from "next/link";
import { notFound } from "next/navigation";

const categories: Record<
  string,
  {
    name: string;
    description: string;
    subcategories: string[];
  }
> = {
  shirts: {
    name: "Men's Shirts",
    description:
      "Explore formal, casual and other men's shirt collections for wholesale enquiries.",
    subcategories: [
      "Formal Shirts",
      "Casual Shirts",
      "Printed Shirts",
      "Checks Shirts",
      "Linen Shirts",
      "Denim Shirts",
      "Full Sleeve Shirts",
      "Half Sleeve Shirts",
    ],
  },

  "t-shirts": {
    name: "Men's T-Shirts",
    description:
      "Explore men's T-shirt collections for retailers and bulk buyers.",
    subcategories: [
      "Round Neck T-Shirts",
      "Polo T-Shirts",
      "Oversized T-Shirts",
      "Printed T-Shirts",
      "Plain T-Shirts",
      "Full Sleeve T-Shirts",
      "Sports T-Shirts",
    ],
  },

  jeans: {
    name: "Men's Jeans",
    description:
      "Browse denim styles and submit your wholesale requirements.",
    subcategories: [
      "Slim Fit Jeans",
      "Regular Fit Jeans",
      "Skinny Fit Jeans",
      "Baggy Jeans",
      "Straight Fit Jeans",
      "Stretch Jeans",
      "Cargo Jeans",
    ],
  },

  trousers: {
    name: "Men's Trousers & Pants",
    description:
      "Wholesale trousers and pants for men's clothing retailers.",
    subcategories: [
      "Formal Trousers",
      "Casual Trousers",
      "Chinos",
      "Cargo Pants",
      "Joggers",
      "Cotton Pants",
      "Linen Pants",
    ],
  },

  "ethnic-wear": {
    name: "Men's Ethnic Wear",
    description:
      "Explore traditional and festive men's clothing collections.",
    subcategories: [
      "Men's Kurtas",
      "Kurta Pajama",
      "Pathani Suits",
      "Nehru Jackets",
      "Festive Wear",
      "Wedding Wear",
    ],
  },

  "winter-wear": {
    name: "Men's Winter Wear",
    description:
      "Wholesale winter clothing collections for retailers.",
    subcategories: [
      "Jackets",
      "Hoodies",
      "Sweatshirts",
      "Sweaters",
      "Winter Coats",
      "Thermal Wear",
    ],
  },

  sportswear: {
    name: "Men's Sportswear",
    description:
      "Sportswear and comfortable clothing for bulk buyers.",
    subcategories: [
      "Track Pants",
      "Track Suits",
      "Sports Shorts",
      "Gym Wear",
      "Sports T-Shirts",
      "Lower Sets",
    ],
  },

  "suits-blazers": {
    name: "Men's Suits & Blazers",
    description:
      "Formal and occasion wear for men's clothing stores.",
    subcategories: [
      "Blazers",
      "Formal Suits",
      "Waistcoats",
      "Wedding Suits",
      "Party Wear Suits",
    ],
  },

  innerwear: {
    name: "Men's Innerwear",
    description:
      "Men's innerwear collections for wholesale enquiries.",
    subcategories: [
      "Vests",
      "Briefs",
      "Boxers",
      "Innerwear Sets",
    ],
  },

  nightwear: {
    name: "Men's Nightwear",
    description:
      "Nightwear and comfortable clothing for retailers.",
    subcategories: [
      "Night Suits",
      "Pajamas",
      "Night Shorts",
      "Cotton Nightwear",
    ],
  },

  accessories: {
    name: "Men's Accessories",
    description:
      "Men's fashion accessories for wholesale buyers.",
    subcategories: [
      "Belts",
      "Socks",
      "Caps",
      "Wallets",
      "Handkerchiefs",
      "Ties",
    ],
  },
};

type PageProps = {
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
}: PageProps) {
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
}: PageProps) {
  const { slug } = await params;
  const category = categories[slug];

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="shrink-0">
            <h1 className="text-xl font-black text-red-700 sm:text-2xl">
              MAHAKAL A TO Z
            </h1>
            <p className="text-xs text-gray-500">
              MEN&apos;S WEAR WHOLESALE
            </p>
          </Link>

          <Link
            href="/enquiry"
            className="rounded-lg bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800"
          >
            Enquire Now
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-700">
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-gray-900">
            {category.name}
          </span>
        </nav>
      </div>

      {/* Category Heading */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl bg-gray-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            Mahakal A To Z Wholesale
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-5xl">
            {category.name}
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-gray-300">
            {category.description}
          </p>

          <Link
            href={`/enquiry?category=${encodeURIComponent(
              category.name
            )}`}
            className="mt-7 inline-flex rounded-lg bg-red-700 px-6 py-3.5 font-bold text-white hover:bg-red-800"
          >
            Enquire for Wholesale Rates
          </Link>
        </div>
      </section>

      {/* Subcategories */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8">
          <h3 className="text-2xl font-black sm:text-3xl">
            Explore Subcategories
          </h3>

          <p className="mt-2 text-gray-600">
            Select a subcategory to explore available products.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {category.subcategories.map((subcategory) => (
            <Link
              key={subcategory}
              href={`/products?category=${encodeURIComponent(
                category.name
              )}&subcategory=${encodeURIComponent(
                subcategory
              )}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
                👔
              </div>

              <h4 className="mt-4 font-bold group-hover:text-red-700">
                {subcategory}
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                View available products
              </p>

              <span className="mt-4 inline-block text-sm font-bold text-red-700">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Wholesale Enquiry */}
      <section className="bg-red-700 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h3 className="text-2xl font-black sm:text-3xl">
            Need Wholesale Prices?
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-red-100">
            Tell us your required products and quantities.
            Our team will contact you to discuss wholesale
            rates, availability and dispatch.
          </p>

          <Link
            href={`/enquiry?category=${encodeURIComponent(
              category.name
            )}`}
            className="mt-6 inline-block rounded-lg bg-white px-7 py-3.5 font-bold text-red-700 hover:bg-red-50"
          >
            Submit Enquiry
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-4 py-8 text-center text-sm text-gray-400">
        <Link
          href="/"
          className="font-bold text-white hover:text-red-400"
        >
          MAHAKAL A TO Z
        </Link>

        <p className="mt-2">
          Men&apos;s Wear Wholesale & Bulk Supply
        </p>

        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} Mahakal A To Z. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
