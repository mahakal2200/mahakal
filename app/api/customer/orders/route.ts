
import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderDocument = {
  customerId?: string;
  userId?: string;
  uid?: string;
  customerUid?: string;
  orderNumber?: string;
  status?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  total?: number;
  totalAmount?: number;
  createdAt?: unknown;
  items?: unknown[];
};

function serializeOrder(
  id: string,
  data: OrderDocument
) {
  const createdAt = data.createdAt as {
    toDate?: () => Date;
  } | string | number | null;

  let serializedDate: string | null = null;

  if (
    createdAt &&
    typeof createdAt === "object" &&
    typeof createdAt.toDate === "function"
  ) {
    serializedDate = createdAt.toDate().toISOString();
  } else if (
    typeof createdAt === "string" ||
    typeof createdAt === "number"
  ) {
    const parsed = new Date(createdAt);

    if (!Number.isNaN(parsed.getTime())) {
      serializedDate = parsed.toISOString();
    }
  }

  return {
    id,
    orderNumber: data.orderNumber ?? id,
    status: data.status ?? data.orderStatus ?? "Pending",
    paymentMethod: data.paymentMethod ?? "COD",
    paymentStatus: data.paymentStatus ?? "Pending",
    totalAmount: Number(data.totalAmount ?? data.total ?? 0),
    createdAt: serializedDate,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) {
      return unauthorized();
    }

    const db = adminDb;
    const collections = ["orders"];

    const snapshots = await Promise.all(
      collections.map(async (collectionName) => {
        const collection = db.collection(collectionName);

        const queries = [
          collection.where("customerId", "==", user.uid),
          collection.where("userId", "==", user.uid),
          collection.where("uid", "==", user.uid),
          collection.where("customerUid", "==", user.uid),
        ];

        return Promise.all(
          queries.map((query) => query.get())
        );
      })
    );

    const orderMap = new Map<
      string,
      ReturnType<typeof serializeOrder>
    >();

    for (const group of snapshots) {
      for (const snapshot of group) {
        for (const document of snapshot.docs) {
          const data = document.data() as OrderDocument;

          // Verify ownership again before returning any order.
          const ownerIds = [
            data.customerId,
            data.userId,
            data.uid,
            data.customerUid,
          ];

          if (!ownerIds.includes(user.uid)) {
            continue;
          }

          orderMap.set(
            document.id,
            serializeOrder(document.id, data)
          );
        }
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
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("[CUSTOMER ORDERS GET]", error);

    return NextResponse.json(
      { error: "Unable to load orders right now." },
      { status: 500 }
    );
  }
}
