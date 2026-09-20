// app/dashboard/layout.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const menuItems = [
    { label: "Overview", href: "/dashboard", icon: "📊" },
    { label: "My Posts", href: "/dashboard/posts", icon: "📝" },
    { label: "New Post", href: "/dashboard/posts/new", icon: "➕" },
    { label: "Comments", href: "/dashboard/comments", icon: "💬" },
    { label: "Edit Profile", href: "/dashboard/profile", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ============================
              SIDEBAR
          ============================ */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:sticky md:top-20">
              {/* User info */}
              <div className="pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {profile?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {profile?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{profile?.username || "username"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
