
import { NextRequest, NextResponse } from "next/server";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date ? date.toISOString() : null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = serializeValue(item);
    }

    return result;
  }

  return value;
}

export async function GET(
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
    const snapshot = await orderRef.get();

    if (!snapshot.exists) {
      return errorResponse("Order nahi mila.", 404);
    }

    const data = snapshot.data() as DocumentData | undefined;

    if (!data) {
      return errorResponse("Order nahi mila.", 404);
    }

    const ownerIds = [
      data.customerId,
      data.userId,
      data.uid,
      data.customerUid,
    ].filter(
      (value): value is string => typeof value === "string"
    );

    if (!ownerIds.includes(user.uid)) {
      return errorResponse("Aapko is order ko dekhne ki permission nahi hai.", 403);
    }

    // Internal ownership and stock-management fields should not be
    // included in the customer-facing response.
    const {
      customerId: _customerId,
      userId: _userId,
      uid: _uid,
      customerUid: _customerUid,
      cancelledBy: _cancelledBy,
      stockRestoredAt: _stockRestoredAt,
      ...publicOrder
    } = data;

    return NextResponse.json(
      {
        order: serializeValue({
          ...publicOrder,
          id: snapshot.id,
          orderId: snapshot.id,
        }),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("[CUSTOMER ORDER DETAIL]", error);

    return errorResponse(
      "Order details load karte waqt error aaya.",
      500
    );
  }
}
