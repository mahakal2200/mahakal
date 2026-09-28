
export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  images?: string[];
  sizes: string[];
  colors: string[];
  fabric: string;
  minimumOrder: number;
  priceLabel: string;
  featured: boolean;
  available: boolean;
};

export const products: Product[] = [];

export function getAllProducts(): Product[] {
  return products.filter((product) => product.available);
}

export function getProductBySlug(
  slug: string
): Product | undefined {
  return products.find(
    (product) => product.slug === slug && product.available
  );
}

export function getProductsByCategory(
  category: string,
  subcategory?: string
): Product[] {
  return products.filter((product) => {
    const categoryMatches =
      product.category.toLowerCase() === category.toLowerCase();

    const subcategoryMatches = subcategory
      ? product.subcategory.toLowerCase() === subcategory.toLowerCase()
      : true;

    return (
      categoryMatches &&
      subcategoryMatches &&
      product.available
    );
  });
}

export function getFeaturedProducts(): Product[] {
  return products.filter(
    (product) => product.featured && product.available
  );
}

export function getProductCategories(): string[] {
  return [...new Set(products.map((product) => product.category))];
}
