
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

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
  pinCode: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;

  const result = value.trim();

  if (!result || result.length > maxLength) return null;

  return result;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string => typeof item === "string"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isRecord(body.customer)) {
      return NextResponse.json(
        { error: "Invalid order request." },
        { status: 400 }
      );
    }

    if (body.paymentMethod !== "COD") {
      return NextResponse.json(
        { error: "Only Cash on Delivery is currently supported." },
        { status: 400 }
      );
    }

    const rawCustomer = body.customer;

    const customer: Customer = {
      name: text(rawCustomer.name, 100) ?? "",
      phone: text(rawCustomer.phone, 10) ?? "",
      address: text(rawCustomer.address, 300) ?? "",
      landmark:
        rawCustomer.landmark === ""
          ? ""
          : text(rawCustomer.landmark, 150) ?? "",
      city: text(rawCustomer.city, 100) ?? "",
      district: text(rawCustomer.district, 100) ?? "",
      pinCode: text(rawCustomer.pinCode, 6) ?? "",
    };

    if (
      customer.name.length < 2 ||
      !/^[6-9]\d{9}$/.test(customer.phone) ||
      !customer.address ||
      !customer.city ||
      !customer.district ||
      !/^\d{6}$/.test(customer.pinCode)
    ) {
      return NextResponse.json(
        { error: "Please enter valid delivery details." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
      return NextResponse.json(
        { error: "Cart must contain between 1 and 30 items." },
        { status: 400 }
      );
    }

    const items: IncomingItem[] = [];

    for (const rawItem of body.items) {
      if (!isRecord(rawItem)) {
        return NextResponse.json(
          { error: "Invalid cart item." },
          { status: 400 }
        );
      }

      const productId = text(rawItem.productId, 150);
      const size =
        rawItem.size === "" ? "" : text(rawItem.size, 50);
      const color =
        rawItem.color === "" ? "" : text(rawItem.color, 80);
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
          { error: "Invalid product selection or quantity." },
          { status: 400 }
        );
      }

      items.push({ productId, quantity, size, color });
    }

    const uniqueProductIds = new Set(items.map((item) => item.productId));

    if (uniqueProductIds.size !== items.length) {
      return NextResponse.json(
        { error: "Duplicate cart entries found. Please review your cart." },
        { status: 400 }
      );
    }

    const orderRef = adminDb.collection("orders").doc();

    const result = await adminDb.runTransaction(async (transaction) => {
      const productRefs = items.map((item) =>
        adminDb.collection("products").doc(item.productId)
      );

      // Read all product documents before performing any writes.
      const productSnapshots = await Promise.all(
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

      let subtotal = 0;

      for (let index = 0; index < items.length; index++) {
        const requested = items[index];
        const snapshot = productSnapshots[index];

        if (!snapshot.exists) {
          throw new Error(`PRODUCT_NOT_FOUND:${requested.productId}`);
        }

        const product = snapshot.data()!;
        const available =
          product.available === undefined
            ? Number(product.stock ?? 0) > 0
            : product.available === true;

        const stock = Number(product.stock ?? 0);
        const unitPrice = Number(product.retailPrice ?? 0);

        if (!available || !Number.isInteger(stock) || stock < requested.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${requested.productId}`);
        }

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error(`PRICE_UNAVAILABLE:${requested.productId}`);
        }

        const sizes = stringArray(product.sizes);
        const colors = stringArray(product.colors);

        if (
          (sizes.length > 0 && !sizes.includes(requested.size)) ||
          (colors.length > 0 && !colors.includes(requested.color))
        ) {
          throw new Error(`INVALID_VARIANT:${requested.productId}`);
        }

        const name =
          typeof product.name === "string" && product.name.trim()
            ? product.name.trim()
            : "Clothing Product";

        const slug =
          typeof product.slug === "string" && product.slug.trim()
            ? product.slug.trim()
            : snapshot.id;

        const images = stringArray(product.images);
        const image =
          typeof product.image === "string" && product.image
            ? product.image
            : images[0] ?? "";

        const lineTotal = Math.round(unitPrice * requested.quantity * 100) / 100;
        subtotal = Math.round((subtotal + lineTotal) * 100) / 100;

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

      // All product reads are complete; writes can now begin.
      for (let index = 0; index < items.length; index++) {
        const requested = items[index];
        const snapshot = productSnapshots[index];
        const currentStock = Number(snapshot.data()?.stock ?? 0);
        const remainingStock = currentStock - requested.quantity;

        transaction.update(snapshot.ref, {
          stock: remainingStock,
          ...(remainingStock === 0 ? { available: false } : {}),
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
        deliveryCharge: null,
        totalAmount: null,
        deliveryStatus: "not_assigned",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { orderId: orderRef.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create order failed:", error);

    if (error instanceof Error) {
      if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
        return NextResponse.json(
          { error: "A product in your cart is no longer available." },
          { status: 409 }
        );
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        return NextResponse.json(
          { error: "Stock changed. Please update your cart and try again." },
          { status: 409 }
        );
      }

      if (error.message.startsWith("PRICE_UNAVAILABLE:")) {
        return NextResponse.json(
          { error: "A product price is unavailable. Please contact support." },
          { status: 409 }
        );
      }

      if (error.message.startsWith("INVALID_VARIANT:")) {
        return NextResponse.json(
          { error: "A selected size or colour is no longer available." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Order could not be created. Please try again." },
      { status: 500 }
    );
  }
}
