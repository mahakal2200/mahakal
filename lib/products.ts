
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

  wholesalePrice: number;
  retailPrice: number;
  stock: number;

  priceLabel: string;

  featured: boolean;
  available: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ProductData = Record<string, unknown>;

/**
 * Static products are intentionally empty.
 * Firestore remains the source of truth for live products.
 */
export const products: Product[] = [];

function toStringValue(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(
  value: unknown,
  fallback = 0
): number {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return fallback;
  }

  if (String(value).trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0
  );
}

/**
 * Normalize a Firestore product document.
 * Pass the Firestore document ID separately.
 */
export function normalizeProduct(
  id: string,
  data: ProductData
): Product {
  const images = toStringArray(data.images);

  const image =
    toStringValue(data.image).trim() ||
    images[0] ||
    "";

  const wholesalePrice = Math.max(
    0,
    toNumberValue(data.wholesalePrice)
  );

  const retailPrice = Math.max(
    0,
    toNumberValue(data.retailPrice)
  );

  const stock = Math.max(
    0,
    toNumberValue(data.stock)
  );

  const minimumOrder = Math.max(
    1,
    Math.floor(toNumberValue(data.minimumOrder, 1))
  );

  const suppliedPriceLabel =
    toStringValue(data.priceLabel).trim();

  const priceLabel =
    suppliedPriceLabel ||
    (retailPrice > 0
      ? `₹${retailPrice}`
      : wholesalePrice > 0
        ? `₹${wholesalePrice} / piece`
        : "Price unavailable");

  return {
    id,
    name: toStringValue(data.name),
    slug: toStringValue(data.slug).trim() || id,

    category: toStringValue(data.category),
    subcategory: toStringValue(data.subcategory),

    description: toStringValue(data.description),

    image,
    images,

    sizes: toStringArray(data.sizes),
    colors: toStringArray(data.colors),
    fabric: toStringValue(data.fabric),

    minimumOrder,
    wholesalePrice,
    retailPrice,
    stock,

    priceLabel,

    featured: data.featured === true,

    available:
      data.available === undefined
        ? stock > 0
        : data.available === true,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function getAllProducts(): Product[] {
  return products.filter(
    (product) => product.available
  );
}

export function getProductBySlug(
  slug: string
): Product | undefined {
  return products.find(
    (product) =>
      product.slug === slug &&
      product.available
  );
}

export function getProductsByCategory(
  category: string,
  subcategory?: string
): Product[] {
  return products.filter((product) => {
    const categoryMatches =
      product.category.toLowerCase() ===
      category.toLowerCase();

    const subcategoryMatches = subcategory
      ? product.subcategory.toLowerCase() ===
        subcategory.toLowerCase()
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
    (product) =>
      product.featured &&
      product.available
  );
}

export function getProductCategories(): string[] {
  return [
    ...new Set(
      products.map((product) => product.category)
    ),
  ];
}
