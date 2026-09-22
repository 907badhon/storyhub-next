"use client";

import Link from "next/link";

export default function PostContent({ post }: { post: any }) {
  const publishedDate = post.publishedAt?.seconds
    ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <article className="max-w-3xl mx-auto px-4">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8"
          />
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
          <Link href={`/author/${post.authorUsername}`}>
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                alt={post.authorName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {post.authorName?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link
              href={`/author/${post.authorUsername}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {post.authorName}
            </Link>
            <p className="text-sm text-gray-500">
              {publishedDate} · {post.viewCount || 0} views
            </p>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
