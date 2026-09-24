"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getCommentsOnUserPosts, deleteComment } from "@/lib/firebase/comments";
import { Comment } from "@/types/comment";

type ManagedComment = Comment & { postTitle?: string; postSlug?: string };

export default function ManageCommentsPage() {
  const { user, loading } = useProtectedRoute();
  const [comments, setComments] = useState<ManagedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const fetchComments = async () => {
    if (!user) return;
    try {
      const data = await getCommentsOnUserPosts(user.uid);
      setComments(data);
    } catch (err) {
      console.error("Comments error:", err);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (user) fetchComments();
  }, [user]);

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (loading || loadingComments) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
        <p className="text-gray-600 mt-2">
          Comments on your posts ({comments.length})
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex gap-3">
                {c.userPhotoURL ? (
                  <img
                    src={c.userPhotoURL}
                    alt={c.userName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {c.userName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/author/${c.userUsername}`}
                        className="font-medium text-gray-900 text-sm hover:underline"
                      >
                        {c.userName}
                      </Link>
                      <span className="text-xs text-gray-500">
                        on{" "}
                        {c.postSlug ? (
                          <Link
                            href={`/blog/${c.postSlug}`}
                            className="text-blue-600 hover:underline"
                          >
                            {c.postTitle}
                          </Link>
                        ) : (
                          c.postTitle
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id!)}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                    {c.content}
                  </p>

                  {c.parentId && (
                    <p className="text-xs text-gray-400 mt-1">
                      (This is a reply)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
