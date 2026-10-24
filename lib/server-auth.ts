
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
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);

    return {
      uid: decoded.uid,
      email: decoded.email,
      phoneNumber: decoded.phone_number,
    };
  } catch {
    return null;
  }
}

export function unauthorized(
  message = "Please sign in to continue."
) {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

export async function requireAdmin(
  request: NextRequest
): Promise<VerifiedUser | null> {
  const user = await getVerifiedUser(request);
  const allowedUid = process.env.ADMIN_UID;

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
    { status: 403 }
  );
}
