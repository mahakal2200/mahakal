
import type { Metadata } from "next";
import ProductDetailsClient from "@/components/ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Product details are fetched dynamically from Firestore on the client.
export const dynamic = "force-dynamic";

function formatProductName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productName = formatProductName(slug);

  return {
    title: `${productName} | Mahakal A To Z`,
    description:
      `Explore ${productName} at Mahakal A To Z. Check retail price, sizes, colours, stock availability and Cash on Delivery eligibility in Ghazipur.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  return <ProductDetailsClient slug={slug} />;
}
