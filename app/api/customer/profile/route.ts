
import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import {
  getVerifiedUser,
  unauthorized,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidText(
  value: unknown,
  maxLength: number
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) {
      return unauthorized();
    }

    const snapshot = await adminDb
      .collection("customers")
      .doc(user.uid)
      .get();

    const profile = snapshot.exists ? snapshot.data() : {};

    return NextResponse.json(
      {
        profile: {
          uid: user.uid,
          name: profile?.name ?? "",
          email: user.email ?? profile?.email ?? "",
          phone: user.phoneNumber ?? profile?.phone ?? "",
          address: profile?.address ?? null,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("[CUSTOMER PROFILE GET]", error);

    return NextResponse.json(
      { error: "Unable to load customer profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getVerifiedUser(request);

    if (!user) {
      return unauthorized();
    }

    const body: unknown = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid profile data." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const updates: Record<string, string> = {};

    if (data.name !== undefined) {
      if (!isValidText(data.name, 100)) {
        return NextResponse.json(
          { error: "Enter a valid name." },
          { status: 400 }
        );
      }

      updates.name = data.name.trim();
    }

    if (data.phone !== undefined) {
      if (
        typeof data.phone !== "string" ||
        !/^\+[1-9]\d{7,14}$/.test(data.phone.trim())
      ) {
        return NextResponse.json(
          {
            error:
              "Enter a valid phone number with country code. Phone changes must also be verified.",
          },
          { status: 400 }
        );
      }

      // A phone number submitted as profile data is not proof
      // of Firebase phone verification. Do not allow it to
      // overwrite the verified authentication phone number.
      if (user.phoneNumber !== data.phone.trim()) {
        return NextResponse.json(
          {
            error:
              "Phone number changes require a separate Firebase OTP verification flow.",
          },
          { status: 400 }
        );
      }

      updates.phone = user.phoneNumber;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid profile fields provided." },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const profileRef = adminDb
      .collection("customers")
      .doc(user.uid);

    await profileRef.set(
      {
        uid: user.uid,
        ...(user.email ? { email: user.email } : {}),
        ...updates,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("[CUSTOMER PROFILE PATCH]", error);

    return NextResponse.json(
      { error: "Unable to update customer profile." },
      { status: 500 }
    );
  }
}
