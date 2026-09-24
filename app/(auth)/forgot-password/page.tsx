// app/(auth)/forgot-password/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, router, user]);

  if (authLoading || user) {
    return <main className="min-h-screen bg-gray-50" />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending reset link...");

    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Reset link sent! Check your email.", { id: toastId });
    } catch (err: any) {
      console.error("Reset password error:", err);

      let errorMessage = "Failed to send reset link. Try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Check your connection.";
      }

      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            {sent
              ? "Check your inbox for the reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <p className="text-gray-700 mb-1">We sent a reset link to:</p>
                <p className="font-medium text-gray-900 break-all">{email}</p>
              </div>

              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-blue-600 hover:underline font-medium text-sm"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Back to login (form state এ) */}
          {!sent && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
