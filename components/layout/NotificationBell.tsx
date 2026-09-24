"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/lib/firebase/notifications";
import { FiBell, FiCheck, FiHeart, FiMessageCircle, FiUserPlus } from "react-icons/fi";

function NotificationIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ReactNode; color: string }> = {
    follow: { icon: <FiUserPlus className="w-3.5 h-3.5" />, color: "bg-indigo-100 text-indigo-600" },
    like: { icon: <FiHeart className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-500" },
    comment: { icon: <FiMessageCircle className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-600" },
    reply: { icon: <FiMessageCircle className="w-3.5 h-3.5" />, color: "bg-violet-100 text-violet-600" },
  };
  const { icon, color } = map[type] || map.comment;
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
  );
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const count = await getUnreadCount(user!.uid);
        setUnread(count);
      } catch (err) {
        console.error("Unread count error:", err);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && user) {
      setLoading(true);
      try {
        const items = await getNotifications(user.uid);
        setNotifications(items);
      } catch (err) {
        console.error("Notifications error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = async (n: Notification) => {
    if (!n.read && n.id) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[480px] overflow-hidden flex flex-col fade-in-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
              >
                <FiCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <FiBell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 20).map((n) => (
                  <Link
                    key={n.id}
                    href={`/author/${n.actorUsername}`}
                    onClick={() => handleItemClick(n)}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition ${!n.read ? "bg-indigo-50/40" : ""}`}
                  >
                    {/* Actor avatar */}
                    <div className="relative flex-shrink-0">
                      {n.actorPhotoURL ? (
                        <img src={n.actorPhotoURL} alt={n.actorName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                          {n.actorName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <NotificationIcon type={n.type} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{n.actorName}</span>{" "}
                        {n.type === "follow" && "started following you"}
                        {n.type === "like" && "liked your post"}
                        {n.type === "comment" && "commented on your post"}
                        {n.type === "reply" && "replied to your comment"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {n.createdAt?.seconds
                          ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>

                    {!n.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
