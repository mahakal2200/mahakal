
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderDocument = {
  orderId?: string;
  orderNumber?: string;

  customerId?: string;
  userId?: string;
  uid?: string;
  customerUid?: string;

  status?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;

  subtotal?: number;
  deliveryCharge?: number;
  total?: number;
  totalAmount?: number;
  currency?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
  items?: unknown[];
};

type SerializedOrder = {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  currency: string;
  createdAt: string | null;
  updatedAt: string | null;
  items: unknown[];
};

function serializeDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    let date: Date;

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    } else if (
      typeof value === "object" &&
      value !== null &&
      "seconds" in value &&
      typeof value.seconds === "number"
    ) {
      date = new Date(value.seconds * 1000);
    } else if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      date = new Date(value);
    } else {
      return null;
    }

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  } catch {
    return null;
  }
}

function safeAmount(value: unknown, fallback = 0): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  ) {
    return value;
  }

  return fallback;
}

function serializeOrder(
  id: string,
  data: OrderDocument
): SerializedOrder {
  const orderId =
    typeof data.orderId === "string" && data.orderId.trim()
      ? data.orderId
      : id;

  const orderNumber =
    typeof data.orderNumber === "string" &&
    data.orderNumber.trim()
      ? data.orderNumber
      : orderId;

  const status =
    typeof data.status === "string" && data.status.trim()
      ? data.status.trim()
      : typeof data.orderStatus === "string" &&
          data.orderStatus.trim()
        ? data.orderStatus.trim()
        : "pending";

  const paymentMethod =
    typeof data.paymentMethod === "string" &&
    data.paymentMethod.trim()
      ? data.paymentMethod.trim()
      : "COD";

  const paymentStatus =
    typeof data.paymentStatus === "string" &&
    data.paymentStatus.trim()
      ? data.paymentStatus.trim()
      : "pending";

  const subtotal = safeAmount(data.subtotal);
  const deliveryCharge = safeAmount(data.deliveryCharge);

  const totalAmount = safeAmount(
    data.totalAmount,
    safeAmount(data.total, subtotal + deliveryCharge)
  );

  const currency =
    typeof data.currency === "string" && data.currency.trim()
      ? data.currency
      : "INR";

  return {
    id,
    orderId,
    orderNumber,
    status,
    paymentMethod,
    paymentStatus,
    subtotal,
    deliveryCharge,
    totalAmount,
    currency,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
    items: Array.isArray(data.items) ? data.items : [],
  };
}

function belongsToUser(
  data: OrderDocument,
  uid: string
): boolean {
  return [
    data.customerId,
    data.userId,
    data.uid,
    data.customerUid,
  ].some((ownerId) => ownerId === uid);
}

export async function GET(request: NextRequest) {
  try {
    // Only return orders for the authenticated Firebase user.
    const user = await getVerifiedUser(request);

    if (!user) {
      return unauthorized();
    }

    const ordersCollection = adminDb.collection("orders");

    // Support orders created with any of the known UID field names.
    const queries = [
      ordersCollection.where("customerId", "==", user.uid),
      ordersCollection.where("userId", "==", user.uid),
      ordersCollection.where("uid", "==", user.uid),
      ordersCollection.where("customerUid", "==", user.uid),
    ];

    const snapshots = await Promise.all(
      queries.map((query) => query.get())
    );

    // Deduplicate orders that match more than one UID field.
    const orderMap = new Map<string, SerializedOrder>();

    for (const snapshot of snapshots) {
      for (const document of snapshot.docs) {
        const data = document.data() as OrderDocument;

        // Verify ownership again before returning order details.
        if (!belongsToUser(data, user.uid)) {
          continue;
        }

        orderMap.set(
          document.id,
          serializeOrder(document.id, data)
        );
      }
    }

    const orders = Array.from(orderMap.values()).sort(
      (a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      }
    );

    return NextResponse.json(
      { orders },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[CUSTOMER ORDERS GET]", error);

    return NextResponse.json(
      {
        error: "Unable to load orders right now.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
