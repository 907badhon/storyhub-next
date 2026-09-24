"use client";

import { useSearchParams } from "next/navigation";
import OverviewTab from "@/components/dashboard/OverviewTab";
import PostsTab from "@/components/dashboard/PostsTab";
import FollowingTab from "@/components/dashboard/FollowingTab";
import BookmarksTab from "@/components/dashboard/BookmarksTab";
import CommentsTab from "@/components/dashboard/CommentsTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "";

  switch (tab) {
    case "posts":
      return <PostsTab />;
    case "following":
      return <FollowingTab />;
    case "bookmarks":
      return <BookmarksTab />;
    case "comments":
      return <CommentsTab />;
    case "profile":
      return <ProfileTab />;
    default:
      return <OverviewTab />;
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>}>
      <DashboardContent />
    </Suspense>
  );
}
