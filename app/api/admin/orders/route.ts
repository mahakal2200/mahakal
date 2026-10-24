
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  forbidden,
  requireAdmin,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ALLOWED_STATUSES.includes(value as OrderStatus)
  );
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        serializeValue(child),
      ])
    );
  }

  return value;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      const userHeader = request.headers.get("authorization");

      if (!userHeader?.startsWith("Bearer ")) {
        return unauthorized();
      }

      return forbidden();
    }

    const snapshot = await adminDb
      .collection("orders")
      .limit(200)
      .get();

    const orders = snapshot.docs.map((document) => ({
      id: document.id,
      ...(
        serializeValue(document.data()) as Record<string, unknown>
      ),
    }));

    return NextResponse.json(
      { orders },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("[ADMIN ORDERS GET]", error);

    return NextResponse.json(
      { error: "Unable to load orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      const authorization = request.headers.get("authorization");

      if (!authorization?.startsWith("Bearer ")) {
        return unauthorized();
      }

      return forbidden();
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.orderId !== "string" ||
      !body.orderId.trim() ||
      !isOrderStatus(body.status)
    ) {
      return NextResponse.json(
        { error: "A valid orderId and status are required." },
        { status: 400 }
      );
    }

    const orderRef = adminDb
      .collection("orders")
      .doc(body.orderId.trim());

    const result = await adminDb.runTransaction(async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);

      if (!orderSnapshot.exists) {
        return { error: "Order not found.", status: 404 };
      }

      const order = orderSnapshot.data()!;

      const currentStatus = String(
        order.status ?? order.orderStatus ?? "Pending"
      );

      const nextStatus = body.status as OrderStatus;

      const transitions: Record<string, string[]> = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Packed", "Cancelled"],
        Packed: ["Shipped", "Cancelled"],
        Shipped: ["Delivered"],
        Delivered: [],
        Cancelled: [],
      };

      if (
        currentStatus !== nextStatus &&
        !transitions[currentStatus]?.includes(nextStatus)
      ) {
        return {
          error: `Cannot change status from ${currentStatus} to ${nextStatus}.`,
          status: 409,
        };
      }

      const update: Record<string, unknown> = {
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: admin.uid,
      };

      if ("orderStatus" in order) {
        update.orderStatus = nextStatus;
      }

      if (nextStatus === "Cancelled" && currentStatus !== "Cancelled") {
        const items = Array.isArray(order.items) ? order.items : [];

        for (const item of items) {
          if (
            !item ||
            typeof item !== "object" ||
            typeof item.productId !== "string"
          ) {
            continue;
          }

          const quantity = Number(item.quantity ?? 0);

          if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            throw new Error("Invalid item quantity in order.");
          }

          const productRef = adminDb
            .collection("products")
            .doc(item.productId);

          const productSnapshot = await transaction.get(productRef);

          if (productSnapshot.exists) {
            transaction.update(productRef, {
              stock: FieldValue.increment(quantity),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
      }

      transaction.update(orderRef, update);

      return { success: true, status: 200 };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN ORDERS PATCH]", error);

    return NextResponse.json(
      { error: "Unable to update the order." },
      { status: 500 }
    );
  }
}
