"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getUserBookmarks } from "@/lib/firebase/bookmarks";
import PostCard from "@/components/blog/PostCard";
import { Post } from "@/types/post";

export default function BookmarksPage() {
  const { user, loading } = useProtectedRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) return;
      try {
        const postIds = await getUserBookmarks(user.uid);
        if (postIds.length === 0) {
          setPosts([]);
          return;
        }

        const promises = postIds.map(async (id) => {
          const snap = await getDoc(doc(db, "posts", id));
          if (!snap.exists()) return null;
          return { id: snap.id, ...snap.data() } as Post;
        });
        const results = await Promise.all(promises);
        setPosts(results.filter(Boolean) as Post[]);
      } catch (err) {
        console.error("Bookmarks load error:", err);
      } finally {
        setLoadingPosts(false);
      }
    }
    fetch();
  }, [user]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
        <p className="text-gray-600 mt-2">
          {posts.length} {posts.length === 1 ? "post" : "posts"} saved
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">You have not saved any posts yet.</p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Explore posts →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
