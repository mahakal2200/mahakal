
import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ addressId: string }>;
};

function validateAddress(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error("Invalid address data.");
  }

  const data = value as Record<string, unknown>;

  function required(field: string, max: number): string {
    const item = data[field];

    if (
      typeof item !== "string" ||
      !item.trim() ||
      item.trim().length > max
    ) {
      throw new Error(`Enter a valid ${field}.`);
    }

    return item.trim();
  }

  const name = required("name", 100);
  const phone = required("phone", 20);
  const addressLine1 = required("addressLine1", 200);
  const city = required("city", 100);
  const state = required("state", 100);
  const pincode = required("pincode", 6);

  if (!/^[+0-9()\-\s]{8,20}$/.test(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Enter a valid 6-digit PIN code.");
  }

  let addressLine2 = "";

  if (data.addressLine2 != null && data.addressLine2 !== "") {
    addressLine2 = required("addressLine2", 200);
  }

  const label =
    data.label == null || data.label === ""
      ? "Home"
      : required("label", 30);

  if (!["Home", "Work", "Other"].includes(label)) {
    throw new Error("Address label must be Home, Work or Other.");
  }

  return {
    name,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    label,
  };
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) {
      return unauthorized();
    }

    const { addressId } = await context.params;

    if (
      !addressId ||
      addressId.length > 150 ||
      addressId.includes("/")
    ) {
      return NextResponse.json(
        { error: "Invalid address ID." },
        { status: 400 }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const address = validateAddress(body);

    const addressRef = adminDb
      .collection("customers")
      .doc(user.uid)
      .collection("addresses")
      .doc(addressId);

    const snapshot = await addressRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    await addressRef.update({
      ...address,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      address: {
        id: addressId,
        ...address,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update address.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
