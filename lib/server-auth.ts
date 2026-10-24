
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export type VerifiedUser = {
  uid: string;
  email?: string;
  phoneNumber?: string;
};

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
  } catch (error) {
    // Do not expose Firebase token verification details to clients.
    console.warn(
      "Firebase ID token verification failed:",
      error instanceof Error ? error.code ?? error.name : "Unknown error"
    );

    return null;
  }
}

export function unauthorized(
  message = "Please sign in to continue."
) {
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

export function forbidden(
  message = "You do not have permission to perform this action."
) {
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
