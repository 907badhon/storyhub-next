"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getFollowingIds } from "@/lib/firebase/follows";
import PostCard from "@/components/blog/PostCard";
import { Post } from "@/types/post";

export default function FollowingPage() {
  const { user, loading } = useProtectedRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) return;
      try {
        const followingIds = await getFollowingIds(user.uid);

        if (followingIds.length === 0) {
          setPosts([]);
          setLoadingPosts(false);
          return;
        }

        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
        );
        const snap = await getDocs(q);

        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];

        const filtered = all
          .filter((p: any) => followingIds.includes(p.authorId))
          .sort((a: any, b: any) => {
            const aT = a.publishedAt?.seconds || 0;
            const bT = b.publishedAt?.seconds || 0;
            return bT - aT;
          });

        setPosts(filtered);
      } catch (err) {
        console.error("Following feed error:", err);
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
        <h1 className="text-3xl font-bold text-gray-900">Following Feed</h1>
        <p className="text-gray-600 mt-2">Posts from authors you follow</p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">
            You are not following anyone yet, or your followed authors have no posts.
          </p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Discover authors →
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
