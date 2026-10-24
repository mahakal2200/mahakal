
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

type Customer = {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;

  const result = value.trim();

  return result.length > 0 && result.length <= maxLength
    ? result
    : null;
}

function optionalText(
  value: unknown,
  maxLength: number
): string | null {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return text(value, maxLength);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string => typeof item === "string"
  );
}

function getDeliveryCharge(): number {
  const configured = process.env.DELIVERY_FLAT_CHARGE;
  const charge = configured === undefined ? 40 : Number(configured);

  if (
    !Number.isFinite(charge) ||
    charge < 0 ||
    charge > 10000
  ) {
    throw new Error("INVALID_DELIVERY_CONFIGURATION");
  }

  return Math.round(charge * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (!isRecord(body) || !isRecord(body.customer)) {
      return NextResponse.json(
        { error: "Invalid order request." },
        { status: 400 }
      );
    }

    if (body.paymentMethod !== "COD") {
      return NextResponse.json(
        {
          error: "Only Cash on Delivery is currently supported.",
        },
        { status: 400 }
      );
    }

    const rawCustomer = body.customer;

    const customer: Customer = {
      name: text(rawCustomer.name, 100) ?? "",
      phone: text(rawCustomer.phone, 10) ?? "",
      address: text(rawCustomer.address, 300) ?? "",
      landmark: optionalText(rawCustomer.landmark, 150) ?? "",
      city: text(rawCustomer.city, 100) ?? "",
      district: text(rawCustomer.district, 100) ?? "",
      state: text(rawCustomer.state, 100) ?? "",
      pinCode: text(rawCustomer.pinCode, 6) ?? "",
    };

    if (
      customer.name.length < 2 ||
      !/^[6-9]\d{9}$/.test(customer.phone) ||
      customer.address.length < 5 ||
      !customer.city ||
      !customer.district ||
      !customer.state ||
      !/^\d{6}$/.test(customer.pinCode)
    ) {
      return NextResponse.json(
        { error: "Please enter valid delivery details." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 30
    ) {
      return NextResponse.json(
        {
          error: "Cart must contain between 1 and 30 items.",
        },
        { status: 400 }
      );
    }

    // Merge duplicate product/size/color combinations.
    const merged = new Map<string, IncomingItem>();

    for (const rawItem of body.items) {
      if (!isRecord(rawItem)) {
        return NextResponse.json(
          { error: "Invalid cart item." },
          { status: 400 }
        );
      }

      const productId = text(rawItem.productId, 150);
      const size = optionalText(rawItem.size, 50);
      const color = optionalText(rawItem.color, 80);
      const quantity = rawItem.quantity;

      if (
        !productId ||
        size === null ||
        color === null ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          {
            error: "Invalid product selection or quantity.",
          },
          { status: 400 }
        );
      }

      const key = JSON.stringify([productId, size, color]);
      const previous = merged.get(key);
      const combinedQuantity =
        (previous?.quantity ?? 0) + quantity;

      if (combinedQuantity > 100) {
        return NextResponse.json(
          {
            error: "Maximum quantity per variant is 100.",
          },
          { status: 400 }
        );
      }

      merged.set(key, {
        productId,
        quantity: combinedQuantity,
        size,
        color,
      });
    }

    const items = Array.from(merged.values());
    const deliveryCharge = getDeliveryCharge();

    const orderRef = adminDb.collection("orders").doc();

    const result = await adminDb.runTransaction(
      async (transaction) => {
        const productRefs = items.map((item) =>
          adminDb.collection("products").doc(item.productId)
        );

        // Complete all reads before performing transaction writes.
        const snapshots = await Promise.all(
          productRefs.map((ref) => transaction.get(ref))
        );

        const verifiedItems: Array<{
          productId: string;
          name: string;
          slug: string;
          image: string;
          unitPrice: number;
          quantity: number;
          size: string;
          color: string;
          lineTotal: number;
        }> = [];

        const quantityByProduct = new Map<string, number>();
        const snapshotByProduct = new Map<
          string,
          (typeof snapshots)[number]
        >();

        let subtotal = 0;

        for (let index = 0; index < items.length; index++) {
          const requested = items[index];
          const snapshot = snapshots[index];

          if (!snapshot.exists) {
            throw new Error("PRODUCT_NOT_FOUND");
          }

          const product = snapshot.data();

          if (!product) {
            throw new Error("PRODUCT_NOT_FOUND");
          }

          const stock = Number(product.stock ?? 0);
          const unitPrice = Number(product.retailPrice ?? 0);

          const available =
            product.available === undefined
              ? Number.isInteger(stock) && stock > 0
              : product.available === true;

          if (
            !available ||
            !Number.isInteger(stock) ||
            stock < 0
          ) {
            throw new Error("PRODUCT_UNAVAILABLE");
          }

          const totalRequested =
            (quantityByProduct.get(snapshot.id) ?? 0) +
            requested.quantity;

          if (totalRequested > stock) {
            throw new Error("INSUFFICIENT_STOCK");
          }

          quantityByProduct.set(
            snapshot.id,
            totalRequested
          );

          snapshotByProduct.set(snapshot.id, snapshot);

          if (
            !Number.isFinite(unitPrice) ||
            unitPrice <= 0
          ) {
            throw new Error("PRICE_UNAVAILABLE");
          }

          const sizes = stringArray(product.sizes);
          const colors = stringArray(product.colors);

          if (
            (sizes.length > 0 &&
              !sizes.includes(requested.size)) ||
            (colors.length > 0 &&
              !colors.includes(requested.color))
          ) {
            throw new Error("INVALID_VARIANT");
          }

          const name =
            typeof product.name === "string" &&
            product.name.trim()
              ? product.name.trim()
              : "Clothing Product";

          const slug =
            typeof product.slug === "string" &&
            product.slug.trim()
              ? product.slug.trim()
              : snapshot.id;

          const images = stringArray(product.images);

          const image =
            typeof product.image === "string" &&
            product.image.trim()
              ? product.image
              : images[0] ?? "";

          const lineTotal =
            Math.round(
              unitPrice * requested.quantity * 100
            ) / 100;

          subtotal =
            Math.round((subtotal + lineTotal) * 100) / 100;

          verifiedItems.push({
            productId: snapshot.id,
            name,
            slug,
            image,
            unitPrice,
            quantity: requested.quantity,
            size: requested.size,
            color: requested.color,
            lineTotal,
          });
        }

        const totalAmount =
          Math.round(
            (subtotal + deliveryCharge) * 100
          ) / 100;

        // Deduct stock once per unique product, including
        // when the cart contains multiple sizes or colours.
        for (const [productId, snapshot] of snapshotByProduct) {
          const quantity = quantityByProduct.get(productId) ?? 0;

          if (quantity === 0) continue;

          const currentStock = Number(
            snapshot.data()?.stock ?? 0
          );

          const remainingStock = currentStock - quantity;

          transaction.update(snapshot.ref, {
            stock: remainingStock,
            available: remainingStock > 0,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        transaction.set(orderRef, {
          orderId: orderRef.id,
          customer,
          items: verifiedItems,
          paymentMethod: "COD",
          paymentStatus: "pending",
          status: "pending",
          subtotal,
          deliveryCharge,
          deliveryDistanceKm: null,
          deliveryPricingMode: "temporary_flat_rate",
          totalAmount,
          currency: "INR",
          deliveryStatus: "not_assigned",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          orderId: orderRef.id,
          subtotal,
          deliveryCharge,
          totalAmount,
          currency: "INR",
        };
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create order failed:", error);

    if (error instanceof Error) {
      const messages: Record<
        string,
        { status: number; message: string }
      > = {
        PRODUCT_NOT_FOUND: {
          status: 409,
          message:
            "A product in your cart is no longer available.",
        },
        PRODUCT_UNAVAILABLE: {
          status: 409,
          message: "A product is currently unavailable.",
        },
        INSUFFICIENT_STOCK: {
          status: 409,
          message:
            "Stock changed. Please update your cart and try again.",
        },
        PRICE_UNAVAILABLE: {
          status: 409,
          message:
            "A product price is unavailable. Please contact support.",
        },
        INVALID_VARIANT: {
          status: 409,
          message:
            "A selected size or colour is no longer available.",
        },
        INVALID_DELIVERY_CONFIGURATION: {
          status: 503,
          message:
            "Delivery charges are not configured correctly.",
        },
      };

      const known = messages[error.message];

      if (known) {
        return NextResponse.json(
          { error: known.message },
          { status: known.status }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Order could not be created. Please try again.",
      },
      { status: 500 }
    );
  }
}
