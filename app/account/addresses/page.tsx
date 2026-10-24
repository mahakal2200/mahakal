
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  label?: string;
};

const initialForm = {
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  label: "Home",
};

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function getToken() {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please sign in first.");
    }

    return user.getIdToken();
  }

  async function loadAddresses(token: string) {
    const response = await fetch("/api/customer/addresses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load addresses.");
    }

    setAddresses(
      Array.isArray(data.addresses) ? data.addresses : []
    );
  }

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace("/account/login");
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch("/api/customer/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load addresses.");
        }

        if (active) {
          setAddresses(
            Array.isArray(data.addresses) ? data.addresses : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load addresses."
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

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const token = await getToken();

      const response = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save address.");
      }

      await loadAddresses(token);
      setForm(initialForm);
      setMessage("Address saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(addressId);

    try {
      const token = await getToken();

      const response = await fetch(
        `/api/customer/addresses?id=${encodeURIComponent(addressId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete address.");
      }

      setAddresses((current) =>
        current.filter((address) => address.id !== addressId)
      );

      setMessage("Address deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete address."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        Loading saved addresses...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Saved Addresses</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your delivery addresses.
        </p>
      </header>

      <nav className="mt-4 flex gap-4 text-sm">
        <Link href="/account/profile" className="underline">
          My Profile
        </Link>
        <Link href="/account/orders" className="underline">
          My Orders
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

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Your addresses</h2>

        {addresses.length === 0 ? (
          <p className="rounded-xl border p-5 text-gray-600">
            No saved addresses yet.
          </p>
        ) : (
          addresses.map((address) => (
            <article key={address.id} className="rounded-xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {address.label ?? "Address"} — {address.name}
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {address.addressLine1}
                    {address.addressLine2
                      ? `, ${address.addressLine2}`
                      : ""}
                  </p>

                  <p className="text-sm text-gray-700">
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Phone: {address.phone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
                >
                  {deletingId === address.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mt-10 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Add new address</h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="address-label" className="mb-1 block text-sm font-medium">
              Address label
            </label>
            <select
              id="address-label"
              value={form.label}
              onChange={(event) => updateField("label", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="address-name" className="mb-1 block text-sm font-medium">
              Recipient name
            </label>
            <input
              id="address-name"
              required
              maxLength={100}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="address-phone" className="mb-1 block text-sm font-medium">
              Phone number
            </label>
            <input
              id="address-phone"
              type="tel"
              required
              maxLength={20}
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="address-line1" className="mb-1 block text-sm font-medium">
              Address line 1
            </label>
            <input
              id="address-line1"
              required
              maxLength={200}
              value={form.addressLine1}
              onChange={(event) => updateField("addressLine1", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="address-line2" className="mb-1 block text-sm font-medium">
              Address line 2 (optional)
            </label>
            <input
              id="address-line2"
              maxLength={200}
              value={form.addressLine2}
              onChange={(event) => updateField("addressLine2", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address-city" className="mb-1 block text-sm font-medium">
                City
              </label>
              <input
                id="address-city"
                required
                maxLength={100}
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="address-state" className="mb-1 block text-sm font-medium">
                State
              </label>
              <input
                id="address-state"
                required
                maxLength={100}
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address-pincode" className="mb-1 block text-sm font-medium">
              PIN code
            </label>
            <input
              id="address-pincode"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={form.pincode}
              onChange={(event) => updateField("pincode", event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving address..." : "Save address"}
          </button>
        </form>
      </section>
    </main>
  );
}
