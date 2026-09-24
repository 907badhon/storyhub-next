"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  getUserStats,
  getRecentPosts,
  getRecentComments,
  UserStats,
} from "@/lib/firebase/stats";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import {
  FiCheckCircle,
  FiEdit3,
  FiEye,
  FiFileText,
  FiHeart,
  FiMessageCircle,
  FiArrowUpRight,
} from "react-icons/fi";

type RecentComment = Comment & { postTitle?: string; postSlug?: string };

export default function DashboardPage() {
  const { user, profile, loading } = useProtectedRoute();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [s, rp, rc] = await Promise.all([
          getUserStats(user.uid),
          getRecentPosts(user.uid, 5),
          getRecentComments(user.uid, 5),
        ]);
        setStats(s);
        setRecentPosts(rp);
        setRecentComments(rc);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-6 text-white shadow-xl shadow-indigo-900/10 sm:p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Creator dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back, {profile?.name || "User"}!
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-200">Track your writing, audience, and community activity from one focused workspace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Posts"
          value={stats?.totalPosts || 0}
          icon={<FiFileText />}
          href="/dashboard?tab=posts"
        />
        <StatCard
          label="Published"
          value={stats?.publishedPosts || 0}
          icon={<FiCheckCircle />}
          href="/dashboard?tab=posts&status=published"
        />
        <StatCard
          label="Drafts"
          value={stats?.draftPosts || 0}
          icon={<FiEdit3 />}
          href="/dashboard?tab=posts&status=draft"
        />
        <StatCard
          label="Total Views"
          value={stats?.totalViews || 0}
          icon={<FiEye />}
        />
        <StatCard label="Total Likes" value={stats?.totalLikes || 0} icon={<FiHeart />} />
        <StatCard
          label="Total Comments"
          value={stats?.totalComments || 0}
          icon={<FiMessageCircle />}
          href="/dashboard?tab=comments"
        />
      </div>

      {/* Recent Posts */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Writing</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Recent Posts</h2>
          </div>
          <Link
            href="/dashboard?tab=posts"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No posts yet. {" "}
            <Link
              href="/dashboard/posts/new"
              className="text-blue-600 hover:underline"
            >
              Write your first post
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}/edit`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.viewCount || 0} views · {post.likesCount || 0} likes
                  </p>
                </div>
                <span
                  className={`ml-3 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {post.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Comments */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">Community</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Recent Comments</h2>
          </div>
          <Link
            href="/dashboard?tab=comments"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentComments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {recentComments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-sky-100 hover:bg-sky-50/30"
              >
                {c.userPhotoURL ? (
                  <img
                    src={c.userPhotoURL}
                    alt={c.userName}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {c.userName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link
                      href={`/author/${c.userUsername}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.userName}
                    </Link>{" "}
                    <span className="text-gray-500">commented on</span>{" "}
                    {c.postSlug && (
                      <Link
                        href={`/blog/${c.postSlug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {c.postTitle}
                      </Link>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
