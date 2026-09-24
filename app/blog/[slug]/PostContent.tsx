"use client";

import Link from "next/link";
import ViewCounter from "@/components/blog/ViewCounter";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import CommentSection from "@/components/blog/CommentSection";
import PostLikeButton from "@/components/blog/PostLikeButton";
import BookmarkButton from "@/components/blog/BookmarkButton";
import {
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiLink,
  FiEye,
  FiClock,
  FiTag,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function PostContent({ post }: { post: any }) {
  const publishedDate = post.publishedAt?.seconds
    ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const readingTime = calculateReadingTime(post.content || "");
  const postUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(postUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(postUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(postUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied!");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <ViewCounter postId={post.id} />

      <article className="max-w-3xl mx-auto px-4">
        {/* Cover image */}
        {post.coverImage && (
          <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* Category */}
        {post.category && (
          <Link
            href={`/category/${post.category}`}
            className="badge-indigo mb-5 inline-flex"
          >
            {post.category}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author + Meta */}
        <div className="flex items-start justify-between gap-4 mb-10 pb-8 border-b border-gray-200 flex-wrap">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Link href={`/author/${post.authorUsername}`}>
              {post.authorPhotoURL ? (
                <img
                  src={post.authorPhotoURL}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {post.authorName?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link
                href={`/author/${post.authorUsername}`}
                className="font-semibold text-gray-900 hover:text-indigo-600 transition text-sm"
              >
                {post.authorName}
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {readingTime} min read
                </span>
                <span>·</span>
                <span>{publishedDate}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <FiEye className="w-3 h-3" />
                  {post.viewCount || 0} views
                </span>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareOnTwitter}
              title="Share on Twitter"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-sky-100 hover:text-sky-600 text-gray-500 flex items-center justify-center transition"
            >
              <FiTwitter className="w-4 h-4" />
            </button>
            <button
              onClick={shareOnFacebook}
              title="Share on Facebook"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-500 flex items-center justify-center transition"
            >
              <FiFacebook className="w-4 h-4" />
            </button>
            <button
              onClick={shareOnLinkedIn}
              title="Share on LinkedIn"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-500 flex items-center justify-center transition"
            >
              <FiLinkedin className="w-4 h-4" />
            </button>
            <button
              onClick={copyLink}
              title="Copy link"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 text-gray-500 flex items-center justify-center transition"
            >
              <FiLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-indigo-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Like + Bookmark */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <PostLikeButton postId={post.id} initialCount={post.likesCount || 0} />
            <BookmarkButton postId={post.id} />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <FiTag className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="badge-gray hover:badge-indigo transition-colors cursor-pointer"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <CommentSection postId={post.id} />
    </main>
  );
}
