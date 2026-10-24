
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AddressInput = {
  id?: string;
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  label?: string;
};

function validateAddress(
  input: unknown
): Omit<AddressInput, "id"> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid address data.");
  }

  const data = input as AddressInput;

  function required(value: unknown, field: string, max = 150) {
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.trim().length > max
    ) {
      throw new Error(`Enter a valid ${field}.`);
    }

    return value.trim();
  }

  const name = required(data.name, "recipient name", 100);
  const phone = required(data.phone, "phone number", 20);
  const addressLine1 = required(data.addressLine1, "address", 200);
  const city = required(data.city, "city", 100);
  const state = required(data.state, "state", 100);
  const pincode = required(data.pincode, "PIN code", 6);

  if (!/^[+0-9()\-\s]{8,20}$/.test(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Enter a valid 6-digit Indian PIN code.");
  }

  let addressLine2 = "";

  if (data.addressLine2) {
    addressLine2 = required(data.addressLine2, "address line 2", 200);
  }

  const label = data.label
    ? required(data.label, "address label", 30)
    : "Home";

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

export async function GET(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) return unauthorized();

    const snapshot = await adminDb
      .collection("customers")
      .doc(user.uid)
      .collection("addresses")
      .get();

    const addresses = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return NextResponse.json(
      { addresses },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[CUSTOMER ADDRESSES GET]", error);

    return NextResponse.json(
      { error: "Unable to load saved addresses." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    const address = validateAddress(body);

    const addressesRef = adminDb
      .collection("customers")
      .doc(user.uid)
      .collection("addresses");

    const existing = await addressesRef.get();

    if (existing.size >= 20) {
      return NextResponse.json(
        { error: "You can save up to 20 addresses." },
        { status: 400 }
      );
    }

    const reference = addressesRef.doc();

    await reference.set({
      ...address,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        address: { id: reference.id, ...address },
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save address.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) return unauthorized();

    const addressId = request.nextUrl.searchParams.get("id");

    if (
      !addressId ||
      addressId.length > 150 ||
      addressId.includes("/")
    ) {
      return NextResponse.json(
        { error: "A valid address ID is required." },
        { status: 400 }
      );
    }

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

    await addressRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CUSTOMER ADDRESSES DELETE]", error);

    return NextResponse.json(
      { error: "Unable to delete address." },
      { status: 500 }
    );
  }
}
