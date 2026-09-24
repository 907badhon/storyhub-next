import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface PostCardProps {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    authorName: string;
    authorPhotoURL?: string;
    publishedAt: any;
    viewCount: number;
    category?: string;
    readingTime?: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const date = post.publishedAt?.seconds
    ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
    >
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="badge-indigo text-[11px] font-semibold backdrop-blur-sm bg-indigo-600/90 text-white border-0">
                {post.category}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          {post.authorPhotoURL ? (
            <img src={post.authorPhotoURL} alt={post.authorName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
              {post.authorName?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-gray-600">{post.authorName}</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {post.viewCount || 0} views
          </span>
          <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            Read more <FiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
