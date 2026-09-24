// components/layout/Navbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/firebase/auth";
import NotificationBell from "./NotificationBell";
import SearchModal from "../search/SearchModal";
import {
  FiSearch,
  FiEdit3,
  FiLogOut,
  FiUser,
  FiGrid,
  FiSettings,
  FiBookmark,
  FiChevronDown,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await logoutUser();
      toast.success("Logged out successfully", { id: toastId });
      setMenuOpen(false);
      router.push("/");
    } catch (err) {
      toast.error("Logout failed", { id: toastId });
    }
  };

  const getInitial = () => {
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo + Desktop Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <HiSparkles className="text-white text-base" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Story<span className="text-indigo-600">Hub</span>
                </span>
              </Link>

              {/* Desktop search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200 group"
              >
                <FiSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Search...</span>
                <kbd className="hidden md:inline-block text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-400 font-mono">⌘K</kbd>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Loading state */}
              {loading && (
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              )}

              {/* Not logged in */}
              {!loading && !user && (
                <>
                  <Link href="/login" className="btn-ghost text-gray-700 font-medium">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Sign up
                  </Link>
                </>
              )}

              {/* Logged in */}
              {!loading && user && (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:flex"
                  >
                    <FiGrid className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard"
                    aria-label="Open dashboard"
                    className="rounded-xl p-2 text-indigo-600 transition hover:bg-indigo-50 sm:hidden"
                  >
                    <FiGrid className="h-5 w-5" />
                  </Link>

                  {/* Write button */}
                  <Link
                    href="/dashboard/posts/new"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-50 transition"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>Write</span>
                  </Link>

                  <NotificationBell />

                  {/* User menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl hover:bg-gray-50 transition group"
                    >
                      {profile?.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.name || "User"}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold ring-2 ring-indigo-100">
                          {getInitial()}
                        </div>
                      )}
                      <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 fade-in-up">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {profile?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={profile?.username ? `/author/${profile.username}` : "/"}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            <FiUser className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            <FiGrid className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/posts/new"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            Write a post
                          </Link>
                          <Link
                            href="/dashboard?tab=bookmarks"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            <FiBookmark className="w-4 h-4" />
                            Saved Posts
                          </Link>
                          <Link
                            href="/dashboard?tab=profile"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            <FiSettings className="w-4 h-4" />
                            Edit Profile
                          </Link>
                        </div>

                        <div className="border-t border-gray-50 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
