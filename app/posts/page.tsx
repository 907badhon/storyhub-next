import type { Metadata } from "next";
import AllPostsPage from "@/components/blog/AllPostsPage";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";

export const metadata: Metadata = {
  title: "All Posts",
  description: `Explore all published stories on ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/posts` },
};

export default function PostsPage() {
  return <AllPostsPage />;
}
