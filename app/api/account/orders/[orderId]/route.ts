
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type OrderItem = {
  productId?: string;
  id?: string;
  quantity?: number;
  [key: string]: unknown;
};

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getVerifiedUser(request);

  if (!user) {
    return unauthorized();
  }

  const { orderId } = await context.params;

  if (
    !orderId ||
    orderId.includes("/") ||
    orderId === "." ||
    orderId === ".."
  ) {
    return errorResponse("Invalid order ID.", 400);
  }

  try {
    const orderRef = adminDb.collection("orders").doc(orderId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);

      if (!orderSnapshot.exists) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const order = orderSnapshot.data();

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const ownerIds = [
        order.customerId,
        order.userId,
        order.uid,
        order.customerUid,
      ].filter((value): value is string => typeof value === "string");

      if (!ownerIds.includes(user.uid)) {
        throw new Error("ORDER_FORBIDDEN");
      }

      const currentStatus =
        typeof order.status === "string"
          ? order.status.toLowerCase()
          : "pending";

      if (currentStatus === "cancelled") {
        return { alreadyCancelled: true };
      }

      if (!["pending", "confirmed"].includes(currentStatus)) {
        throw new Error("ORDER_NOT_CANCELLABLE");
      }

      if (order.stockRestoredAt) {
        throw new Error("STOCK_ALREADY_RESTORED");
      }

      if (!Array.isArray(order.items) || order.items.length === 0) {
        throw new Error("ORDER_ITEMS_INVALID");
      }

      const quantities = new Map<string, number>();

      for (const rawItem of order.items as OrderItem[]) {
        const productId =
          typeof rawItem.productId === "string"
            ? rawItem.productId
            : typeof rawItem.id === "string"
              ? rawItem.id
              : "";

        const quantity = Number(rawItem.quantity);

        if (
          !productId ||
          productId.includes("/") ||
          !Number.isSafeInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error("ORDER_ITEMS_INVALID");
        }

        quantities.set(
          productId,
          (quantities.get(productId) || 0) + quantity
        );
      }

      const productRefs = [...quantities.keys()].map((productId) =>
        adminDb.collection("products").doc(productId)
      );

      // Read every product before writing anything in the transaction.
      const productSnapshots = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      for (let index = 0; index < productSnapshots.length; index++) {
        const productSnapshot = productSnapshots[index];
        const productRef = productRefs[index];

        if (!productSnapshot.exists) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const product = productSnapshot.data();

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const currentStock = Number(product.stock);
        const restoreQuantity =
          quantities.get(productRef.id) || 0;

        if (
          !Number.isSafeInteger(currentStock) ||
          currentStock < 0 ||
          !Number.isSafeInteger(restoreQuantity) ||
          restoreQuantity <= 0
        ) {
          throw new Error("PRODUCT_STOCK_INVALID");
        }

        transaction.update(productRef, {
          stock: currentStock + restoreQuantity,
          available: true,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.update(orderRef, {
        status: "Cancelled",
        cancellationReason: "Cancelled by customer",
        cancelledBy: user.uid,
        cancelledAt: FieldValue.serverTimestamp(),
        stockRestoredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { alreadyCancelled: false };
    });

    return NextResponse.json({
      success: true,
      alreadyCancelled: result.alreadyCancelled,
      message: result.alreadyCancelled
        ? "Order is already cancelled."
        : "Order cancelled successfully.",
    });
  } catch (error: unknown) {
    const code =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    switch (code) {
      case "ORDER_NOT_FOUND":
        return errorResponse("Order nahi mila.", 404);
      case "ORDER_FORBIDDEN":
        return errorResponse(
          "Aap sirf apna order cancel kar sakte hain.",
          403
        );
      case "ORDER_NOT_CANCELLABLE":
        return errorResponse(
          "Is order ko ab cancel nahi kiya ja sakta.",
          409
        );
      case "STOCK_ALREADY_RESTORED":
        return errorResponse(
          "Stock pehle hi restore ho chuka hai. Admin se contact karein.",
          409
        );
      case "ORDER_ITEMS_INVALID":
        return errorResponse(
          "Order items valid nahi hain. Admin se contact karein.",
          409
        );
      case "PRODUCT_NOT_FOUND":
      case "PRODUCT_STOCK_INVALID":
        return errorResponse(
          "Product stock update nahi ho saka. Admin se contact karein.",
          409
        );
      default:
        console.error("[CUSTOMER ORDER CANCELLATION]", error);
        return errorResponse("Order cancel karte waqt error aaya.", 500);
    }
  }
}
