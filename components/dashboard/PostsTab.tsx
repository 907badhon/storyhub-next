"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getUserPosts, deletePost } from "@/lib/firebase/posts";
import { Post } from "@/types/post";
import { FiEdit3, FiEye, FiFileText, FiHeart, FiPlus, FiTrash2 } from "react-icons/fi";

export default function MyPostsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const { user, loading } = useProtectedRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    try {
      const data = await getUserPosts(user.uid);
      setPosts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const visiblePosts = statusFilter
    ? posts.filter((post) => post.status === statusFilter)
    : posts;

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    const toastId = toast.loading("Deleting...");
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (loading || loadingPosts) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Your writing space</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {statusFilter === "published" ? "Published Posts" : statusFilter === "draft" ? "Draft Posts" : "My Posts"}
          </h1>
          <p className="mt-2 text-slate-500">
            {visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"} in this view.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="btn-primary"
        >
          <FiPlus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {visiblePosts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
          <FiFileText className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <p className="mb-4 font-medium text-slate-600">No posts yet</p>
          <Link
            href="/dashboard/posts/new"
            className="font-medium text-indigo-600 hover:underline"
          >
            {statusFilter ? "No posts match this filter." : "Write your first post →"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-slate-100 to-violet-100">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <FiFileText className="h-9 w-9 text-indigo-300" />
                )}
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : post.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
                  {post.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-semibold leading-snug text-slate-950">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {post.excerpt || "No excerpt added for this post."}
                </p>
                <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><FiEye /> {post.viewCount || 0}</span>
                  <span className="flex items-center gap-1"><FiHeart /> {post.likesCount || 0}</span>
                  <span className="ml-auto truncate">/{post.slug}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                {post.status === "published" && (
                  <Link
                    href={`/blog/${post.slug}`}
                    title="View post"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  title="Edit post"
                  className="flex items-center justify-center rounded-lg bg-indigo-50 px-3 py-2 text-indigo-600 transition hover:bg-indigo-100"
                >
                  <FiEdit3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id!, post.title)}
                  title="Delete post"
                  className="rounded-lg px-3 py-2 text-red-500 transition hover:bg-red-50"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
