"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { followUser, unfollowUser, isFollowing } from "@/lib/firebase/follows";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const { user, profile } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isSelf = user?.uid === targetUserId;

  useEffect(() => {
    async function check() {
      if (!user || isSelf) {
        setLoading(false);
        return;
      }
      try {
        const result = await isFollowing(user.uid, targetUserId);
        setFollowing(result);
      } catch (err) {
        console.error("Check follow error:", err);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [user, targetUserId, isSelf]);

  const handleToggle = async () => {
    if (!user) {
      toast.error("Please login to follow");
      return;
    }
    if (isSelf || processing) return;

    setProcessing(true);

    try {
      if (following) {
        await unfollowUser(user.uid, targetUserId);
        setFollowing(false);
        toast.success("Unfollowed");
      } else {
        await followUser(user.uid, targetUserId, profile || undefined);
        setFollowing(true);
        toast.success("Following!");
      }
    } catch (err: any) {
      console.error("Follow error:", err);
      toast.error("Failed to follow");
    } finally {
      setProcessing(false);
    }
  };

  if (isSelf) return null;

  const isLoading = loading || processing;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-6 py-2.5 rounded-lg font-medium transition ${
        following
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
