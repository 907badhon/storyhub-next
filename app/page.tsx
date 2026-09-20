// app/test/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function TestPage() {
  const { user, profile, loading } = useAuth();

  const showSuccess = () => {
    toast.success("এটা একটা success message!");
  };

  const showError = () => {
    toast.error("এটা একটা error message!");
  };

  const showLoading = () => {
    const loadingToast = toast.loading("Loading...");
    setTimeout(() => {
      toast.success("Loaded!", { id: loadingToast });
    }, 2000);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔐 Auth Test</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-medium">Loading:</span>
            <span className="text-lg">{loading ? "⏳ Yes" : "✅ No"}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-medium">User:</span>
            <span className="text-lg">
              {user ? `✅ ${user.email}` : "❌ Not logged in"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Profile:</span>
            <span className="text-lg">{profile ? "✅ Loaded" : "❌ None"}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🔔 Toast Test</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={showSuccess}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Success Toast
            </button>
            <button
              onClick={showError}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Error Toast
            </button>
            <button
              onClick={showLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Loading → Success
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
