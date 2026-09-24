"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  addComment,
  getPostComments,
  deleteComment,
  updateComment,
  likeComment,
  unlikeComment,
  getUserCommentLikes,
} from "@/lib/firebase/comments";
import { Comment } from "@/types/comment";

export default function CommentSection({ postId }: { postId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [likingComments, setLikingComments] = useState<string[]>([]);

  const fetchComments = async () => {
    try {
      const data = await getPostComments(postId);
      setComments(data);

      if (user) {
        const commentIds = data.map((c) => c.id!).filter(Boolean);
        const liked = await getUserCommentLikes(user.uid, commentIds);
        setLikedComments(liked);
      }
    } catch (err: any) {
      console.error("Comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const toastId = toast.loading("Posting...");

    try {
      await addComment({
        postId,
        userId: user.uid,
        userName: profile.name,
        userUsername: profile.username,
        userPhotoURL: profile.photoURL || "",
        content: newComment.trim(),
        parentId: null,
      });
      setNewComment("");
      await fetchComments();
      toast.success("Comment posted!", { id: toastId });
    } catch (err: any) {
      console.error("Comment error:", err.message);
      toast.error("Failed to post comment", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }

    // ✅ Race condition fix: already processing হলে কিছু করো না
    if (likingComments.includes(commentId)) return;

    setLikingComments((prev) => [...prev, commentId]);

    const isLiked = likedComments.includes(commentId);

    try {
      if (isLiked) {
        await unlikeComment(commentId, user.uid);
        setLikedComments((prev) => prev.filter((id) => id !== commentId));
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likesCount: Math.max(0, c.likesCount - 1) }
              : c,
          ),
        );
      } else {
        await likeComment(commentId, user.uid);
        setLikedComments((prev) => [...prev, commentId]);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c,
          ),
        );
      }
    } catch (err: any) {
      console.error("Like error:", err);
      toast.error("Failed to like");
    } finally {
      setLikingComments((prev) => prev.filter((id) => id !== commentId));
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await deleteComment(commentId);
      await fetchComments();
      toast.success("Comment deleted", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  // Top-level comments (no parentId)
  const topComments = comments.filter((c) => !c.parentId);

  return (
    <section className="max-w-3xl mx-auto px-4 mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                disabled={submitting}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-gray-600">
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Log in
            </Link>{" "}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : topComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {topComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
              currentUserId={user?.uid}
              currentUserProfile={profile}
              onDelete={handleDelete}
              onRefresh={fetchComments}
              postId={postId}
              onLike={handleLike}
              likedComments={likedComments}
              likingComments={likingComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  allComments,
  currentUserId,
  currentUserProfile,
  onDelete,
  onRefresh,
  postId,
  likedComments,
  onLike,
  likingComments,
}: {
  comment: Comment;
  allComments: Comment[];
  currentUserId?: string;
  currentUserProfile: any;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  postId: string;
  likedComments: string[];
  onLike: (commentId: string) => void;
  likingComments: string[];
}) {
  const isOwner = currentUserId === comment.userId;
  const isLiked = comment.id ? likedComments.includes(comment.id) : false;
  const isLiking = comment.id ? likingComments.includes(comment.id) : false;
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const date = comment.createdAt?.seconds
    ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    const toastId = toast.loading("Updating...");
    try {
      await updateComment(comment.id!, editContent.trim());
      setEditing(false);
      await onRefresh();
      toast.success("Comment updated", { id: toastId });
    } catch (err) {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !currentUserProfile) {
      toast.error("Please login to reply");
      return;
    }
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    const toastId = toast.loading("Posting reply...");

    try {
      await addComment({
        postId,
        userId: currentUserId,
        userName: currentUserProfile.name,
        userUsername: currentUserProfile.username,
        userPhotoURL: currentUserProfile.photoURL || "",
        content: replyContent.trim(),
        parentId: comment.id!,
      });
      setReplyContent("");
      setReplying(false);
      await onRefresh();
      toast.success("Reply posted!", { id: toastId });
    } catch (err) {
      toast.error("Failed to post reply", { id: toastId });
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <Link href={`/author/${comment.userUsername}`}>
          {comment.userPhotoURL ? (
            <img
              src={comment.userPhotoURL}
              alt={comment.userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
              {comment.userName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/author/${comment.userUsername}`}
                className="font-medium text-gray-900 text-sm hover:underline"
              >
                {comment.userName}
              </Link>
              <span className="text-xs text-gray-500">· {date}</span>
            </div>

            {editing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          <div className="mt-1 flex gap-3 text-xs items-center">
            <button
              onClick={() => onLike(comment.id!)}
              disabled={isLiking}
              className={`${
                isLiked ? "text-blue-600 font-medium" : "text-gray-500"
              } ${
                isLiking
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:underline hover:text-blue-600 cursor-pointer"
              }`}
            >
              {isLiking
                ? "◌ Loading..."
                : isLiked
                  ? `♥ Liked${comment.likesCount > 0 ? ` (${comment.likesCount})` : ""}`
                  : `♡ Like${comment.likesCount > 0 ? ` (${comment.likesCount})` : ""}`}
            </button>

            {currentUserId && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-gray-500 hover:text-blue-600"
              >
                Reply
              </button>
            )}

            {isOwner && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id!)}
                  className="text-gray-500 hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {replying && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-3">
              {currentUserProfile?.photoURL ? (
                <img
                  src={currentUserProfile.photoURL}
                  alt={currentUserProfile.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0 text-xs">
                  {currentUserProfile?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.userName}...`}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  disabled={submittingReply}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplying(false);
                      setReplyContent("");
                    }}
                    className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply || !replyContent.trim()}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingReply ? "Posting..." : "Reply"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  allComments={allComments}
                  currentUserId={currentUserId}
                  currentUserProfile={currentUserProfile}
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  postId={postId}
                  likedComments={likedComments}
                  onLike={onLike}
                  likingComments={likingComments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
