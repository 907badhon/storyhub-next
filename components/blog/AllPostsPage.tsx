"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Post } from "@/types/post";
import PostCard from "@/components/blog/PostCard";
import { FiArrowLeft, FiArrowDown, FiClock } from "react-icons/fi";

const PAGE_SIZE = 9;

type PageCursor = QueryDocumentSnapshot<DocumentData> | null;

export default function AllPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<PageCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async (nextCursor: PageCursor = null) => {
    if (nextCursor && loadingMore) return;

    if (nextCursor) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const postsQuery = nextCursor
        ? query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            startAfter(nextCursor),
            limit(PAGE_SIZE),
          )
        : query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(PAGE_SIZE),
          );
      const snapshot = await getDocs(postsQuery);
      const nextPosts = snapshot.docs.map((postDoc) => ({
        id: postDoc.id,
        ...postDoc.data(),
      })) as Post[];

      setPosts((current) => (nextCursor ? [...current, ...nextPosts] : nextPosts));
      setCursor(snapshot.docs.at(-1) ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FiClock className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
            </div>
            <p className="mt-3 text-gray-600">Explore every published story on StoryHub.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="skeleton aspect-video" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-4 w-24 rounded-full" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <FiClock className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="font-medium text-gray-500">No published posts yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {hasMore && cursor && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => loadPosts(cursor)}
                  disabled={loadingMore}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiArrowDown className="h-4 w-4" />
                  {loadingMore ? "Loading..." : "Load more posts"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
