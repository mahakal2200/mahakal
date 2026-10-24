
"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type User,
  type ApplicationVerifier,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export async function registerCustomer(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Please enter your name.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const credential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  try {
    await updateProfile(credential.user, {
      displayName: cleanName,
    });
  } catch (error) {
    await credential.user.delete().catch(() => undefined);
    throw error;
  }

  return credential.user;
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const credential = await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  return credential.user;
}

export async function requestPhoneOtp(
  phoneNumber: string,
  verifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  const cleanPhone = phoneNumber.trim();

  if (!/^\+[1-9]\d{7,14}$/.test(cleanPhone)) {
    throw new Error(
      "Enter a valid phone number with country code, e.g. +919876543210."
    );
  }

  return signInWithPhoneNumber(
    auth,
    cleanPhone,
    verifier
  );
}

export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  otp: string
): Promise<User> {
  const cleanOtp = otp.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new Error("Enter the 6-digit OTP.");
  }

  const credential = await confirmation.confirm(cleanOtp);

  return credential.user;
}

export async function logoutCustomer(): Promise<void> {
  await signOut(auth);
}

export async function getCustomerIdToken(): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return user.getIdToken();
}
