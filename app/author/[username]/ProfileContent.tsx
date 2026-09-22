"use client";

import Link from "next/link";
import { UserProfile } from "@/types/user";

export default function ProfileContent({ author }: { author: any }) {
  const profile = author as UserProfile;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="-mt-16 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div className="sm:pb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.name}
            </h1>
            <p className="text-gray-600">@{profile?.username}</p>
          </div>
        </div>

        {profile?.bio && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {profile?.postsCount || 0}
            </p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {profile?.followersCount || 0}
            </p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {profile?.followingCount || 0}
            </p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {profile?.socialLinks &&
          Object.values(profile.socialLinks).some(Boolean) && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-3">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    Twitter
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

        <p className="text-sm text-gray-500 pb-8">
          Joined{" "}
          {profile?.createdAt
            ? new Date(
                (profile.createdAt as any).seconds * 1000,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "recently"}
        </p>
      </div>
    </main>
  );
}
