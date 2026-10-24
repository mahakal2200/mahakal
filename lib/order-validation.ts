
import "server-only";

export type ValidatedOrderItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type ValidatedShippingAddress = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type ValidatedCheckout = {
  items: ValidatedOrderItem[];
  shippingAddress: ValidatedShippingAddress;
  paymentMethod: "COD";
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requiredText(
  value: unknown,
  field: string,
  maxLength = 200
): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw new Error(`Invalid ${field}.`);
  }

  return value.trim();
}

export function validateCheckout(
  value: unknown
): ValidatedCheckout {
  if (!isRecord(value)) {
    throw new Error("Invalid checkout request.");
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (value.items.length > 50) {
    throw new Error("Too many different items in one order.");
  }

  const items: ValidatedOrderItem[] = value.items.map(
    (item, index) => {
      if (!isRecord(item)) {
        throw new Error(`Invalid item at position ${index + 1}.`);
      }

      const productId = requiredText(
        item.productId ?? item.id,
        "product ID",
        150
      );

      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        throw new Error("Each quantity must be between 1 and 100.");
      }

      const size =
        item.size == null
          ? undefined
          : requiredText(item.size, "size", 50);

      const color =
        item.color == null
          ? undefined
          : requiredText(item.color, "color", 50);

      return { productId, quantity, size, color };
    }
  );

  const address = value.shippingAddress;

  if (!isRecord(address)) {
    throw new Error("Shipping address is required.");
  }

  const phone = requiredText(address.phone, "phone", 20);

  if (!/^[+0-9()\-\s]{8,20}$/.test(phone)) {
    throw new Error("Invalid phone number.");
  }

  const pincode = requiredText(address.pincode, "pincode", 10);

  if (!/^[0-9]{6}$/.test(pincode)) {
    throw new Error("Enter a valid 6-digit Indian PIN code.");
  }

  if (
    value.paymentMethod != null &&
    value.paymentMethod !== "COD"
  ) {
    throw new Error("Only Cash on Delivery is currently supported.");
  }

  const shippingAddress: ValidatedShippingAddress = {
    name: requiredText(address.name, "recipient name", 100),
    phone,
    addressLine1: requiredText(
      address.addressLine1,
      "address line",
      200
    ),
    city: requiredText(address.city, "city", 100),
    state: requiredText(address.state, "state", 100),
    pincode,
  };

  if (address.addressLine2 != null && address.addressLine2 !== "") {
    shippingAddress.addressLine2 = requiredText(
      address.addressLine2,
      "address line 2",
      200
    );
  }

  return {
    items,
    shippingAddress,
    paymentMethod: "COD",
  };
}
