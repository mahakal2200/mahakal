
export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

const CART_STORAGE_KEY = "mahakal-retail-cart";
export const CART_UPDATED_EVENT = "mahakal-cart-updated";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    typeof item.size === "string" &&
    typeof item.color === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.stock === "number" &&
    Number.isFinite(item.stock) &&
    item.stock >= 0
  );
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem);
  } catch (error) {
    console.error("Could not read Mahakal cart:", error);
    return [];
  }
}

function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(items)
    );

    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  } catch (error) {
    console.error("Could not save Mahakal cart:", error);
    throw new Error("Cart save nahi ho paaya. Browser storage check karein.");
  }
}

export function addToCart(
  newItem: CartItem
): { success: boolean; message: string } {
  if (
    !Number.isInteger(newItem.quantity) ||
    newItem.quantity < 1 ||
    newItem.stock < 1 ||
    newItem.quantity > newItem.stock
  ) {
    return { success: false, message: "Selected quantity available stock se zyada hai." };
  }

  if (!Number.isFinite(newItem.unitPrice) || newItem.unitPrice <= 0) {
    return { success: false, message: "Is product ki retail price abhi available nahi hai." };
  }

  try {
    const items = getCartItems();
    const existingIndex = items.findIndex(
      (item) =>
        item.id === newItem.id &&
        item.size === newItem.size &&
        item.color === newItem.color
    );

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const nextQuantity = existing.quantity + newItem.quantity;

      if (nextQuantity > newItem.stock) {
        return {
          success: false,
          message: `Is variant ke sirf ${newItem.stock} pieces available hain.`,
        };
      }

      items[existingIndex] = {
        ...existing,
        ...newItem,
        quantity: nextQuantity,
      };
    } else {
      items.push(newItem);
    }

    saveCartItems(items);
    return { success: true, message: "Product cart mein add ho gaya." };
  } catch {
    return { success: false, message: "Cart save nahi ho paaya. Dobara try karein." };
  }
}

export function updateCartQuantity(
  id: string,
  size: string,
  color: string,
  quantity: number
): void {
  const items = getCartItems();
  const updated = items
    .map((item) => {
      if (item.id !== id || item.size !== size || item.color !== color) {
        return item;
      }

      return {
        ...item,
        quantity: Math.max(1, Math.min(item.stock, Math.floor(quantity))),
      };
    })
    .filter((item) => item.stock > 0);

  saveCartItems(updated);
}

export function removeFromCart(
  id: string,
  size: string,
  color: string
): void {
  saveCartItems(
    getCartItems().filter(
      (item) =>
        !(item.id === id && item.size === size && item.color === color)
    )
  );
}

export function clearCart(): void {
  saveCartItems([]);
}
