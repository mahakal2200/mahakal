
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export type VerifiedUser = {
  uid: string;
  email?: string;
  phoneNumber?: string;
};

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Returns the verified user or null if the token is missing or invalid.
 */
export async function getVerifiedUser(
  request: NextRequest
): Promise<VerifiedUser | null> {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return null;
  }

  const token = match[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);

    return {
      uid: decoded.uid,
      ...(decoded.email ? { email: decoded.email } : {}),
      ...(decoded.phone_number
        ? { phoneNumber: decoded.phone_number }
        : {}),
    };
  } catch (error: unknown) {
    // Log only the error code/name; never expose token details to clients.
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "Unknown error";

    console.warn("Firebase ID token verification failed:", errorCode);

    return null;
  }
}

/**
 * Returns a 401 response when authentication is required.
 */
export function unauthorized(
  message = "Please sign in to continue."
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Returns the authenticated user only if their UID matches ADMIN_UID.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<VerifiedUser | null> {
  const user = await getVerifiedUser(request);
  const allowedUid = process.env.ADMIN_UID?.trim();

  if (!allowedUid || !user || user.uid !== allowedUid) {
    return null;
  }

  return user;
}

/**
 * Returns a 403 response when the authenticated user lacks permission.
 */
export function forbidden(
  message = "You do not have permission to perform this action."
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
