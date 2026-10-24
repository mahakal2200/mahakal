
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

type CustomerProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: unknown;
};

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace("/account/login");
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch("/api/customer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load profile.");
        }

        if (!active) return;

        const loaded = data.profile as CustomerProfile;

        setProfile(loaded);
        setName(loaded.name ?? "");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanName = name.trim();

    if (!cleanName || cleanName.length > 100) {
      setError("Enter a name between 1 and 100 characters.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update profile.");
      }

      setProfile((current) =>
        current ? { ...current, name: cleanName } : current
      );

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your Mahakal customer account.
        </p>
      </header>

      <nav className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link className="underline" href="/account/orders">
          My Orders
        </Link>
        <Link className="underline" href="/products">
          Continue shopping
        </Link>
      </nav>

      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-green-800">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border p-6"
      >
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-medium">
            Registered email
          </label>
          <input
            id="profile-email"
            value={profile?.email ?? ""}
            readOnly
            className="w-full rounded-lg border bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium">
            Verified mobile number
          </label>
          <input
            id="profile-phone"
            value={profile?.phone ?? ""}
            readOnly
            className="w-full rounded-lg border bg-gray-50 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Changing your mobile number requires a separate OTP verification flow.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
}
