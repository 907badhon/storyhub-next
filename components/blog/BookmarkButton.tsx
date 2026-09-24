"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addBookmark, removeBookmark, hasUserBookmarkedPost } from "@/lib/firebase/bookmarks";
import { FiBookmark } from "react-icons/fi";
import { BsBookmarkFill } from "react-icons/bs";

export default function BookmarkButton({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function check() {
      if (!user) { setLoading(false); return; }
      try {
        const isBookmarked = await hasUserBookmarkedPost(postId, user.uid);
        setBookmarked(isBookmarked);
      } catch (err) {
        console.error("Check bookmark error:", err);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [postId, user]);

  const handleToggle = async () => {
    if (!user) { toast.error("Please login to bookmark"); return; }
    if (processing) return;
    setProcessing(true);
    try {
      if (bookmarked) {
        await removeBookmark(postId, user.uid);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await addBookmark(postId, user.uid);
        setBookmarked(true);
        toast.success("Saved to bookmarks");
      }
    } catch (err: any) {
      console.error("Bookmark error:", err);
      toast.error("Failed to bookmark");
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = loading || processing;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
        bookmarked
          ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {bookmarked ? (
        <BsBookmarkFill className="w-4 h-4 text-amber-600" />
      ) : (
        <FiBookmark className="w-4 h-4" />
      )}
      <span>{isLoading ? "..." : bookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}
