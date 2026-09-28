
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_UID = "krycYafGxWcyghoeL4qIcvZAJjC3";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        return;
      }

      if (user.uid === ADMIN_UID) {
        router.replace("/admin/products");
      } else {
        await signOut(auth);
        setError("आपको Admin Dashboard का access नहीं है।");
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("यह अकाउंट Admin के लिए अधिकृत नहीं है।");
        return;
      }

      router.replace("/admin/products");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Email या Password गलत है।");
          break;

        case "auth/too-many-requests":
          setError(
            "बहुत बार गलत प्रयास हुए हैं। कुछ समय बाद दोबारा प्रयास करें।"
          );
          break;

        case "auth/invalid-email":
          setError("कृपया सही Email Address दर्ज करें।");
          break;

        default:
          setError("Login नहीं हो पाया। कृपया दोबारा प्रयास करें।");
      }
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Admin Login जाँच हो रही है...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white">
            M
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Mahakal A To Z
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Admin Panel Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Admin Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login to Admin Panel"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Authorized Admin Access Only
        </p>
      </div>
    </main>
  );
}
