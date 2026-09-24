// app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, useState } from "react";
import {
  FiGrid,
  FiFileText,
  FiEdit3,
  FiUsers,
  FiBookmark,
  FiMessageCircle,
  FiSettings,
  FiX,
  FiMenu,
} from "react-icons/fi";

const menuItems = [
  { label: "Overview", tab: "", icon: FiGrid, color: "text-indigo-500" },
  { label: "My Posts", tab: "posts", icon: FiFileText, color: "text-violet-500" },
  { label: "Following Feed", tab: "following", icon: FiUsers, color: "text-emerald-500" },
  { label: "Bookmarks", tab: "bookmarks", icon: FiBookmark, color: "text-amber-500" },
  { label: "Comments", tab: "comments", icon: FiMessageCircle, color: "text-sky-500" },
  { label: "Edit Profile", tab: "profile", icon: FiSettings, color: "text-gray-500" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const currentTab = searchParams.get("tab") || "";

  return (
    <div className="flex h-full flex-col">
      {/* User info */}
      <div className="border-b border-indigo-100 bg-indigo-50 p-5 pb-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Your workspace
          </p>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-1 text-indigo-400 hover:bg-white md:hidden">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt={profile.name} className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
              {profile?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{profile?.name || "User"}</p>
            <p className="truncate text-xs text-slate-500">@{profile?.username || "username"}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto bg-white p-3">
        {menuItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;
          return (
            <Link
              key={item.tab}
              href={item.tab ? `/dashboard?tab=${item.tab}` : "/dashboard"}
              onClick={onClose}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-white" : item.color}`}>
                <Icon className="w-4 h-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Write button */}
      <div className="border-t border-slate-100 bg-white p-3">
        <Link
          href="/dashboard/posts/new"
          onClick={onClose}
          className="btn-primary w-full justify-center"
        >
          <FiEdit3 className="w-4 h-4" />
          New Post
        </Link>
      </div>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-shrink-0">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 md:sticky md:top-20" style={{ height: "fit-content", maxHeight: "calc(100vh - 6rem)" }}>
        <Suspense fallback={<div className="h-96 skeleton" />}>
          <SidebarContent />
        </Suspense>
      </div>
    </aside>
  );
}

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-indigo-950/20 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden overflow-hidden">
        <Suspense fallback={<div className="h-full skeleton" />}>
          <SidebarContent onClose={onClose} />
        </Suspense>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition"
        >
          <FiMenu className="w-4 h-4" />
          Dashboard Menu
        </button>
        <Link href="/dashboard/posts/new" className="btn-primary text-xs px-3 py-2">
          <FiEdit3 className="w-3.5 h-3.5" />
          New Post
        </Link>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex gap-6">
          <DashboardSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
