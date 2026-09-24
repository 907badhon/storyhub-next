"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import PostCard from "./PostCard";
import { Post } from "@/types/post";
import { FiClock } from "react-icons/fi";

export default function LatestPostsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        console.log("🔍 Fetching latest posts...");
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(6),
        );
        const snap = await getDocs(q);
        console.log("📦 Found:", snap.docs.length, "posts");
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
        setPosts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="skeleton w-8 h-8" />
          <div className="skeleton h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="skeleton aspect-video" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-24 rounded-full" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FiClock className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Latest Posts</h2>
        </div>
        <Link
          href="/posts"
          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          View all posts
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {!error && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <FiClock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No posts yet.</p>
          <Link href="/dashboard/posts/new" className="text-indigo-600 text-sm font-medium hover:underline mt-2 inline-block">
            Be the first to write one →
          </Link>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
