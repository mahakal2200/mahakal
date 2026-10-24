
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

type OrderItem = {
  productId: string;
  quantity: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ALLOWED_STATUSES.includes(value as OrderStatus)
  );
}

function normalizeStatus(value: unknown): OrderStatus | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  const statusMap: Record<string, OrderStatus> = {
    pending: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statusMap[normalized] ?? null;
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
    const date = value.toDate();

    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.toISOString()
      : null;
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

function authErrorResponse(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return unauthorized();
  }

  return forbidden();
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return authErrorResponse(request);
    }

    const snapshot = await adminDb
      .collection("orders")
      .limit(200)
      .get();

    const orders = snapshot.docs.map((document) => {
      const data = serializeValue(
        document.data()
      ) as Record<string, unknown>;

      return {
        ...data,
        id: document.id,
        orderId:
          typeof data.orderId === "string"
            ? data.orderId
            : document.id,
        status:
          normalizeStatus(data.status ?? data.orderStatus) ??
          "Pending",
      };
    });

    orders.sort((a, b) => {
      const dateA =
        typeof a.createdAt === "string"
          ? new Date(a.createdAt).getTime()
          : 0;

      const dateB =
        typeof b.createdAt === "string"
          ? new Date(b.createdAt).getTime()
          : 0;

      return (
        (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0)
      );
    });

    return NextResponse.json(
      { orders },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[ADMIN ORDERS GET]", error);

    return jsonError("Unable to load orders.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return authErrorResponse(request);
    }

    const body: unknown = await request.json().catch(() => null);

    if (
      !isRecord(body) ||
      typeof body.orderId !== "string" ||
      !body.orderId.trim() ||
      !isOrderStatus(body.status)
    ) {
      return jsonError(
        "A valid orderId and status are required.",
        400
      );
    }

    const orderId = body.orderId.trim();
    const nextStatus = body.status;

    const orderRef = adminDb
      .collection("orders")
      .doc(orderId);

    const result = await adminDb.runTransaction(
      async (transaction) => {
        // Read the order first.
        const orderSnapshot = await transaction.get(orderRef);

        if (!orderSnapshot.exists) {
          return {
            success: false as const,
            status: 404,
            error: "Order not found.",
          };
        }

        const order = orderSnapshot.data();

        if (!order) {
          return {
            success: false as const,
            status: 404,
            error: "Order not found.",
          };
        }

        const currentStatus = normalizeStatus(
          order.status ?? order.orderStatus
        );

        if (!currentStatus) {
          return {
            success: false as const,
            status: 409,
            error:
              "The existing order status is invalid. Please review this order.",
          };
        }

        const transitions: Record<OrderStatus, OrderStatus[]> = {
          Pending: ["Confirmed", "Cancelled"],
          Confirmed: ["Packed", "Cancelled"],
          Packed: ["Shipped", "Cancelled"],
          Shipped: ["Delivered"],
          Delivered: [],
          Cancelled: [],
        };

        // Repeated requests for the current status are idempotent.
        if (currentStatus === nextStatus) {
          return {
            success: true as const,
            unchanged: true,
          };
        }

        if (!transitions[currentStatus].includes(nextStatus)) {
          return {
            success: false as const,
            status: 409,
            error: `Cannot change status from ${currentStatus} to ${nextStatus}.`,
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

        if (
          nextStatus !== "Cancelled" ||
          currentStatus === "Cancelled"
        ) {
          transaction.update(orderRef, update);

          return {
            success: true as const,
            unchanged: false,
          };
        }

        // Aggregate quantities by product ID so duplicate variants
        // restore the combined quantity in one product update.
        const items: OrderItem[] = [];
        const quantityByProduct = new Map<string, number>();

        if (!Array.isArray(order.items) || order.items.length === 0) {
          return {
            success: false as const,
            status: 409,
            error:
              "Order items are missing. Stock was not changed.",
          };
        }

        for (const rawItem of order.items) {
          if (
            !isRecord(rawItem) ||
            typeof rawItem.productId !== "string" ||
            !rawItem.productId.trim()
          ) {
            return {
              success: false as const,
              status: 409,
              error:
                "Order contains invalid product details. Stock was not changed.",
            };
          }

          const quantity = rawItem.quantity;

          if (
            typeof quantity !== "number" ||
            !Number.isSafeInteger(quantity) ||
            quantity <= 0
          ) {
            return {
              success: false as const,
              status: 409,
              error:
                "Order contains an invalid quantity. Stock was not changed.",
            };
          }

          const productId = rawItem.productId.trim();
          const combined =
            (quantityByProduct.get(productId) ?? 0) + quantity;

          if (!Number.isSafeInteger(combined)) {
            return {
              success: false as const,
              status: 409,
              error:
                "Product quantity is invalid. Stock was not changed.",
            };
          }

          quantityByProduct.set(productId, combined);
          items.push({ productId, quantity });
        }

        const productRefs = Array.from(
          quantityByProduct.keys()
        ).map((productId) =>
          adminDb.collection("products").doc(productId)
        );

        // IMPORTANT: complete all Firestore reads before any writes.
        const productSnapshots = await Promise.all(
          productRefs.map((ref) => transaction.get(ref))
        );

        const productUpdates: Array<{
          ref: (typeof productRefs)[number];
          remainingStock: number;
        }> = [];

        for (let index = 0; index < productSnapshots.length; index++) {
          const productSnapshot = productSnapshots[index];
          const productRef = productRefs[index];

          if (!productSnapshot.exists) {
            // Do not silently mark cancellation complete if stock
            // cannot be restored for a missing product document.
            return {
              success: false as const,
              status: 409,
              error:
                "A product from this order no longer exists. Stock restoration requires manual review.",
            };
          }

          const product = productSnapshot.data();

          if (!product) {
            return {
              success: false as const,
              status: 409,
              error:
                "Product data is unavailable. Stock was not changed.",
            };
          }

          const currentStock = Number(product.stock ?? 0);
          const restoreQuantity =
            quantityByProduct.get(productRef.id) ?? 0;

          if (
            !Number.isSafeInteger(currentStock) ||
            currentStock < 0 ||
            !Number.isSafeInteger(restoreQuantity) ||
            restoreQuantity <= 0 ||
            !Number.isSafeInteger(currentStock + restoreQuantity)
          ) {
            return {
              success: false as const,
              status: 409,
              error:
                "Product stock data is invalid. Stock was not changed.",
            };
          }

          productUpdates.push({
            ref: productRef,
            remainingStock: currentStock + restoreQuantity,
          });
        }

        // All reads have completed. It is now safe to write.
        for (const productUpdate of productUpdates) {
          transaction.update(productUpdate.ref, {
            stock: productUpdate.remainingStock,
            available: productUpdate.remainingStock > 0,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        transaction.update(orderRef, {
          ...update,
          stockRestoredAt: FieldValue.serverTimestamp(),
        });

        return {
          success: true as const,
          unchanged: false,
        };
      }
    );

    if (!result.success) {
      return jsonError(result.error, result.status);
    }

    return NextResponse.json(
      {
        success: true,
        unchanged: result.unchanged,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[ADMIN ORDERS PATCH]", error);

    return jsonError("Unable to update the order.", 500);
  }
}
