
import type { Metadata } from "next";
import ProductDetailsClient from "@/components/ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Products are fetched dynamically from Firestore on the client.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const productName = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${productName} | Mahakal A To Z`,
    description:
      `View wholesale ${productName} at Mahakal A To Z. Contact us for wholesale pricing, stock and bulk orders.`,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  return <ProductDetailsClient slug={slug} />;
}
