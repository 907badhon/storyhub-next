"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "@/types/user";
import { FiUsers, FiFileText, FiArrowRight } from "react-icons/fi";

export default function PopularAuthors() {
  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const all = snap.docs.map((d) => d.data() as UserProfile);
        const sorted = all
          .filter((u) => (u.postsCount || 0) > 0 || (u.followersCount || 0) > 0)
          .sort(
            (a, b) =>
              (b.followersCount || 0) - (a.followersCount || 0) ||
              (b.postsCount || 0) - (a.postsCount || 0)
          )
          .slice(0, 6);
        setAuthors(sorted);
      } catch (err) {
        console.error("Popular authors error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || authors.length === 0) return null;

  return (
    <section id="authors" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 pb-20">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
          <FiUsers className="w-4 h-4 text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Popular Authors</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((author) => (
          <Link
            key={author.uid}
            href={`/author/${author.username}`}
            className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 card-hover"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {author.photoURL ? (
                <img
                  src={author.photoURL}
                  alt={author.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                  {author.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition text-sm">
                {author.name}
              </p>
              <p className="text-xs text-gray-400 truncate mb-2">@{author.username}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <FiFileText className="w-3 h-3" />
                  {author.postsCount || 0} posts
                </span>
                <span className="flex items-center gap-1">
                  <FiUsers className="w-3 h-3" />
                  {author.followersCount || 0}
                </span>
              </div>
            </div>

            <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  );
}
