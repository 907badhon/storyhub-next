// app/dashboard/page.tsx

"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DashboardPage() {
  const { user, profile, loading } = useProtectedRoute();

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            এইটাই তোমার dashboard। এখানে তুমি তোমার posts manage করতে পারবে।
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-gray-900">
              {profile?.postsCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Followers</p>
            <p className="text-3xl font-bold text-gray-900">
              {profile?.followersCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Following</p>
            <p className="text-3xl font-bold text-gray-900">
              {profile?.followingCount || 0}
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Your Info</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{profile?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">@{profile?.username}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium capitalize">{profile?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Verified:</span>
              <span className="font-medium">
                {user?.emailVerified ? "✅ Yes" : "❌ No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
