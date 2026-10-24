
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

type ApiResponse = {
  addresses?: SavedAddress[];
  error?: string;
};

type Props = {
  onSelect: (address: SavedAddress) => void;
  selectedAddressId?: string;
};

export default function SavedAddressSelector({
  onSelect,
  selectedAddressId,
}: Props) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setAddresses([]);
          setError("Saved addresses dekhne ke liye login karein.");
          setLoading(false);
        }
        return;
      }

      try {
        if (active) {
          setLoading(true);
          setError("");
        }

        const token = await user.getIdToken();

        const response = await fetch("/api/customer/addresses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(data.error || "Addresses load nahi ho paye.");
        }

        if (!active) return;

        const list = Array.isArray(data.addresses)
          ? data.addresses
          : [];

        setAddresses(list);

        if (list.length === 0) {
          setError(
            "Abhi koi saved address nahi hai. Account ke Addresses section mein address add karein."
          );
        } else {
          setError("");
          const selected =
            list.find((address) => address.id === selectedAddressId) ??
            list[0];

          onSelect(selected);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Addresses load karte waqt error aaya."
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
  }, [onSelect, selectedAddressId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Saved addresses load ho rahe hain...</p>;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Delivery address</h3>

      {error && (
        <p className="rounded-md bg-gray-100 p-3 text-sm text-gray-700">
          {error}
        </p>
      )}

      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => {
            const selected = address.id === selectedAddressId;

            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address)}
                className={`block w-full rounded-lg border p-4 text-left transition ${
                  selected
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                aria-pressed={selected}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selected}
                    readOnly
                    aria-label={`Select address for ${address.name}`}
                  />

                  <span className="space-y-1 text-sm">
                    <span className="block font-semibold">{address.name}</span>
                    <span className="block">{address.phone}</span>
                    <span className="block">
                      {address.addressLine1}
                      {address.addressLine2
                        ? `, ${address.addressLine2}`
                        : ""}
                    </span>
                    <span className="block">
                      {address.city}, {address.state} - {address.pincode}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}

          <a
            href="/account/addresses"
            className="inline-block text-sm font-medium underline"
          >
            Manage saved addresses
          </a>
        </div>
      )}
    </section>
  );
}
