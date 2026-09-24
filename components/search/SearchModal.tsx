"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { searchPosts, searchAuthors } from "@/lib/firebase/search";
import { Post } from "@/types/post";
import { UserProfile } from "@/types/user";
import { FiSearch, FiX, FiUser, FiFileText, FiArrowRight } from "react-icons/fi";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [input, setInput] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setInput("");
      setPosts([]);
      setAuthors([]);
      setSearched(false);
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setPosts([]);
        setAuthors([]);
        setSearched(false);
        return;
      }
      const runSearch = async () => {
        setLoading(true);
        setSearched(true);
        try {
          const [p, a] = await Promise.all([searchPosts(input), searchAuthors(input)]);
          setPosts(p);
          setAuthors(a);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      };
      runSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] border border-gray-100 fade-in-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          ) : (
            <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search posts, authors..."
            className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder-gray-400"
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ml-1"
          >
            <kbd className="text-xs font-mono">ESC</kbd>
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!searched && (
            <div className="py-16 text-center text-gray-500">
              <FiSearch className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-base font-medium text-gray-700">Start typing to search</p>
              <p className="text-sm mt-1 text-gray-400">Find posts, authors and more</p>
            </div>
          )}

          {searched && !loading && posts.length === 0 && authors.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-700 font-medium">No results for "{input}"</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {searched && !loading && (
            <div className="p-3 space-y-1">
              {/* Authors section */}
              {authors.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Authors
                  </p>
                  {authors.map((author) => (
                    <Link
                      key={author.uid}
                      href={`/author/${author.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition group"
                    >
                      {author.photoURL ? (
                        <img src={author.photoURL} alt={author.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {author.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700">{author.name}</p>
                        <p className="text-xs text-gray-400 truncate">@{author.username}</p>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Posts section */}
              {posts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Posts
                  </p>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      onClick={onClose}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-100">
                        <FiFileText className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-700">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.excerpt}</p>
                        )}
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
