"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { likePost, unlikePost, hasUserLikedPost } from "@/lib/firebase/postLikes";
import { FiHeart } from "react-icons/fi";
import { BsHeartFill } from "react-icons/bs";

export default function PostLikeButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function check() {
      if (!user) { setLoading(false); return; }
      try {
        const isLiked = await hasUserLikedPost(postId, user.uid);
        setLiked(isLiked);
      } catch (err) {
        console.error("Check like error:", err);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [postId, user]);

  const handleToggle = async () => {
    if (!user) { toast.error("Please login to like"); return; }
    if (processing) return;
    setProcessing(true);
    try {
      if (liked) {
        await unlikePost(postId, user.uid);
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await likePost(postId, user.uid);
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch (err: any) {
      console.error("Like error:", err);
      toast.error("Failed to like post");
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = loading || processing;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 group ${
        liked
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {liked ? (
        <BsHeartFill className="w-4 h-4 text-red-500 animate-[heartbeat_0.3s_ease]" />
      ) : (
        <FiHeart className="w-4 h-4 group-hover:scale-110 transition-transform" />
      )}
      <span>
        {isLoading ? "..." : liked ? "Liked" : "Like"}
        {count > 0 && <span className="ml-1 font-bold">{count}</span>}
      </span>
    </button>
  );
}
