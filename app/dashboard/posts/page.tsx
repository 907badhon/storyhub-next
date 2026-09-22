"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getUserPosts, deletePost } from "@/lib/firebase/posts";
import { Post } from "@/types/post";

export default function MyPostsPage() {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-2">{posts.length} posts</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">এখনো কোনো post নেই</p>
          <Link
            href="/dashboard/posts/new"
            className="text-blue-600 hover:underline font-medium"
          >
            প্রথম post লেখো →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  /blog/{post.slug}
                </p>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {post.status}
                </span>
              </div>

              <div className="flex gap-2 ml-4">
                {post.status === "published" && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5"
                  >
                    View
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(post.id!, post.title)}
                  className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
