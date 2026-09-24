"use client";

import Link from "next/link";
import { UserProfile } from "@/types/user";
import { Post } from "@/types/post";
import FollowButton from "@/components/profile/FollowButton";
import PostCard from "@/components/blog/PostCard";
import {
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiFileText,
  FiUsers,
  FiUserCheck,
  FiCalendar,
} from "react-icons/fi";

export default function ProfileContent({
  author,
  posts,
}: {
  author: any;
  posts: Post[];
}) {
  const profile = author as UserProfile;

  const createdAt = profile?.createdAt as any;
  const joinedTimestamp = createdAt?.seconds
    ? createdAt.seconds * 1000
    : createdAt instanceof Date
      ? createdAt.getTime()
      : null;
  const joinedDate = joinedTimestamp
    ? new Date(joinedTimestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "recently";

  const socialLinks = [
    { key: "twitter", icon: FiTwitter, label: "Twitter", color: "text-sky-500 hover:bg-sky-50" },
    { key: "github", icon: FiGithub, label: "GitHub", color: "text-gray-700 hover:bg-gray-100" },
    { key: "linkedin", icon: FiLinkedin, label: "LinkedIn", color: "text-blue-600 hover:bg-blue-50" },
    { key: "website", icon: FiGlobe, label: "Website", color: "text-emerald-600 hover:bg-emerald-50" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative mx-auto h-64 max-w-6xl px-4 sm:px-6 lg:px-8 sm:h-72">
          <div className="absolute top-4 left-4 max-w-md sm:left-6 lg:left-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
              StoryHub writer
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              Stories, ideas, and experience shared with the community.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative -mt-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Avatar */}
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="-mt-20 h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-xl ring-4 ring-indigo-100 sm:-mt-20"
              />
            ) : (
              <div className="-mt-20 flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 text-4xl font-bold text-white shadow-xl ring-4 ring-indigo-100 sm:-mt-20">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            <div className="min-w-0 flex-1 sm:pb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{profile?.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                @{profile?.username}
                <span className="text-slate-300">·</span>
                <FiCalendar className="w-3.5 h-3.5" />
                Joined {joinedDate}
              </p>
            </div>

            <div className="sm:pb-1">
              <FollowButton targetUserId={profile?.uid || ""} />
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="mt-6 max-w-2xl border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-600">
              {profile.bio}
            </p>
          )}

          {/* Social links */}
          {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map(({ key, icon: Icon, label, color }) => {
                const href = (profile.socialLinks as any)?.[key];
                if (!href) return null;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className={`flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium transition ${color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: FiFileText, label: "Posts", value: posts.length, color: "text-indigo-600 bg-indigo-50" },
            { icon: FiUsers, label: "Followers", value: profile?.followersCount || 0, color: "text-violet-600 bg-violet-50" },
            { icon: FiUserCheck, label: "Following", value: profile?.followingCount || 0, color: "text-emerald-600 bg-emerald-50" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Published work</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <FiFileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No published posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
