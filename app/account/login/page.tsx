
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import {
  getCustomerIdToken,
  loginCustomer,
  registerCustomer,
  requestPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/customer-auth";

type LoginMode = "login" | "register" | "phone";

export default function CustomerLoginPage() {
  const [mode, setMode] = useState<LoginMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  function resetMessages() {
    setMessage("");
    setError("");
  }

  async function handleEmailSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    resetMessages();
    setBusy(true);

    try {
      if (mode === "register") {
        await registerCustomer(name, email, password);
      } else {
        await loginCustomer(email, password);
      }

      window.location.assign("/account/orders");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoneSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    resetMessages();
    setBusy(true);

    try {
      if (!confirmation) {
        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(
            auth,
            "customer-recaptcha",
            { size: "normal" }
          );
        }

        const verifier = recaptchaRef.current;
        await verifier.render();

        const result = await requestPhoneOtp(phone, verifier);
        setConfirmation(result);
        setMessage("OTP sent. Enter the 6-digit code.");
      } else {
        await verifyPhoneOtp(confirmation, otp);
        window.location.assign("/account/orders");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Phone verification failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    resetMessages();

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("If the account exists, a password reset email will be sent.");
    } catch {
      setError("Unable to request a password reset. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogoutTokenCheck() {
    try {
      const token = await getCustomerIdToken();
      setMessage("Your sign-in is active. Token obtained securely.");
      return token;
    } catch {
      setError("Please sign in first.");
      return null;
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "register"
            ? "Create your account"
            : mode === "phone"
              ? "Mobile OTP login"
              : "Customer login"}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage your Mahakal orders.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setConfirmation(null);
              resetMessages();
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Email login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setConfirmation(null);
              resetMessages();
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("phone");
              setConfirmation(null);
              resetMessages();
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Mobile OTP
          </button>
        </div>

        {message && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {mode !== "phone" ? (
          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="customer-name" className="mb-1 block text-sm font-medium">
                  Full name
                </label>
                <input
                  id="customer-name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            )}

            <div>
              <label htmlFor="customer-email" className="mb-1 block text-sm font-medium">
                Email address
              </label>
              <input
                id="customer-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="customer-password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="customer-password"
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {busy
                ? "Please wait..."
                : mode === "register"
                  ? "Create account"
                  : "Login"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                disabled={busy}
                onClick={handlePasswordReset}
                className="w-full text-sm underline"
              >
                Forgot password?
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
            {!confirmation ? (
              <div>
                <label htmlFor="customer-phone" className="mb-1 block text-sm font-medium">
                  Mobile number with country code
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+919876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="customer-otp" className="mb-1 block text-sm font-medium">
                  6-digit OTP
                </label>
                <input
                  id="customer-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            )}

            <div id="customer-recaptcha" />

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {busy
                ? "Please wait..."
                : confirmation
                  ? "Verify OTP"
                  : "Send OTP"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
