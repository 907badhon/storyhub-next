"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import PostCard from "./PostCard";
import { Post } from "@/types/post";
import { FiTrendingUp } from "react-icons/fi";

export default function TrendingSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("viewCount", "desc"),
          limit(3),
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
        setPosts(data);
      } catch (err: any) {
        console.error("❌ Trending error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section id="trending" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
          <FiTrendingUp className="w-4 h-4 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
        <span className="badge-yellow ml-2">Hot</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <div key={post.id} className="relative">
            {/* Rank badge */}
            <div className="absolute -top-3 -left-3 z-10 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm shadow-indigo-300">
              {idx + 1}
            </div>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
