"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateSlug } from "@/lib/utils/slug";
import { FiArrowRight, FiBookOpen, FiX } from "react-icons/fi";

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryItem {
  name: string;
  count: number;
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const postsQuery = query(
          collection(db, "posts"),
          where("status", "==", "published"),
        );
        const snapshot = await getDocs(postsQuery);
        const counts = new Map<string, number>();

        snapshot.docs.forEach((postDoc) => {
          const category = String(postDoc.data().category || "").trim();
          if (category) counts.set(category, (counts.get(category) || 0) + 1);
        });

        setCategories(
          Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
        );
      } catch (loadError) {
        console.error("Category load error:", loadError);
        setError("Categories could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close categories"
        onClick={onClose}
        className="fixed inset-0 z-[90] cursor-default bg-slate-950/25 backdrop-blur-sm"
      />
      <aside className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Explore</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Categories</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-16 rounded-2xl" />)}
            </div>
          ) : error ? (
            <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <FiBookOpen className="mx-auto mb-3 h-9 w-9 text-slate-200" />
              <p className="text-sm text-slate-500">No categories yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/category/${generateSlug(category.name)}`}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{category.name}</span>
                    <span className="text-xs text-slate-500">{category.count} {category.count === 1 ? "published post" : "published posts"}</span>
                  </span>
                  <FiArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
