"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase/config";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { UserProfile } from "@/types/user";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiFileText,
  FiMessageCircle,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

type AdminComment = Comment & { postTitle?: string };

export default function AdminPage() {
  const { profile, loading: authLoading } = useProtectedRoute({
    requireRole: "admin",
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersSnapshot, postsSnapshot, commentsSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "posts")),
        getDocs(collection(db, "comments")),
      ]);

      const nextUsers = usersSnapshot.docs.map((item) => item.data() as UserProfile);
      const nextPosts = postsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Post[];
      const postTitles = new Map(nextPosts.map((post) => [post.id, post.title]));
      const nextComments = commentsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        postTitle: postTitles.get(item.data().postId),
      })) as AdminComment[];

      setUsers(nextUsers);
      setPosts(nextPosts);
      setComments(nextComments);
    } catch (error) {
      console.error("Admin data error:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === "admin") loadAdminData();
  }, [profile]);

  const updateUserRole = async (userId: string, role: UserProfile["role"]) => {
    try {
      await updateDoc(doc(db, "users", userId), { role });
      setUsers((current) => current.map((user) => (user.uid === userId ? { ...user, role } : user)));
      toast.success("User role updated");
    } catch (error) {
      console.error("Role update error:", error);
      toast.error("Failed to update role");
    }
  };

  const removePost = async (postId: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently?`)) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts((current) => current.filter((post) => post.id !== postId));
      toast.success("Post deleted");
    } catch (error) {
      console.error("Post delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  const removeComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "comments", commentId));
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Comment delete error:", error);
      toast.error("Failed to delete comment");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-40 rounded-3xl bg-slate-200" /><div className="mt-6 h-64 rounded-3xl bg-slate-200" /></div></div>;
  }

  if (profile?.role !== "admin") {
    return <main className="min-h-screen bg-slate-50 px-4 py-20 text-center"><FiShield className="mx-auto mb-4 h-10 w-10 text-slate-300" /><h1 className="text-2xl font-bold text-slate-900">Admin access required</h1><p className="mt-2 text-slate-500">You do not have permission to view this page.</p><Link href="/dashboard" className="mt-6 inline-flex text-indigo-600 hover:underline">Back to dashboard</Link></main>;
  }

  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const draftPosts = posts.filter((post) => post.status === "draft").length;

  return (
    <main className="min-h-screen bg-slate-50 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-6 text-white shadow-xl shadow-indigo-900/10 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Administration</p><h1 className="text-3xl font-bold sm:text-4xl">Control center</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-200">Review the StoryHub community, moderate content, and manage user roles.</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><FiShield className="h-7 w-7 text-indigo-200" /><p className="mt-2 text-xs text-indigo-200">Admin mode</p></div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminStat icon={<FiUsers />} label="Users" value={users.length} />
          <AdminStat icon={<FiFileText />} label="All posts" value={posts.length} />
          <AdminStat icon={<FiCheckCircle />} label="Published" value={publishedPosts} />
          <AdminStat icon={<FiMessageCircle />} label="Comments" value={comments.length} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><SectionHeading label="User management" title="Community members" /><div className="mt-5 space-y-3">{users.slice(0, 8).map((user) => <div key={user.uid} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600">{user.name?.charAt(0).toUpperCase() || "?"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-slate-500">@{user.username || "unknown"}</p></div><select aria-label={`Role for ${user.name}`} value={user.role || "user"} onChange={(event) => updateUserRole(user.uid, event.target.value as UserProfile["role"])} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600"><option value="user">User</option><option value="author">Author</option><option value="admin">Admin</option></select></div>)}</div></div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><SectionHeading label="Content overview" title="Publishing health" /><div className="mt-5 space-y-3"><HealthRow label="Published posts" value={publishedPosts} total={posts.length} color="bg-emerald-500" /><HealthRow label="Draft posts" value={draftPosts} total={posts.length} color="bg-amber-500" /><HealthRow label="Published ratio" value={posts.length ? Math.round((publishedPosts / posts.length) * 100) : 0} total={100} suffix="%" color="bg-indigo-500" /></div><Link href="/posts" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">View public posts <FiArrowUpRight className="h-4 w-4" /></Link></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ModerationList title="Recent posts" empty="No posts found." items={posts.slice().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 6)} renderItem={(post) => <div className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{post.title}</p><p className="text-xs text-slate-500">by @{post.authorUsername} · {post.status}</p></div><button type="button" onClick={() => removePost(post.id!, post.title)} title="Delete post" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><FiTrash2 className="h-4 w-4" /></button></div>} />
          <ModerationList title="Recent comments" empty="No comments found." items={comments.slice().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 6)} renderItem={(comment) => <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm text-slate-700">{comment.content}</p><p className="mt-1 text-xs text-slate-500">by @{comment.userUsername}{comment.postTitle ? ` · ${comment.postTitle}` : ""}</p></div><button type="button" onClick={() => removeComment(comment.id!)} title="Delete comment" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><FiTrash2 className="h-4 w-4" /></button></div>} />
        </section>
      </div>
    </main>
  );
}

function AdminStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span></div><p className="mt-3 text-3xl font-bold text-slate-950">{value}</p></div>; }
function SectionHeading({ label, title }: { label: string; title: string }) { return <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">{label}</p><h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2></div>; }
function HealthRow({ label, value, total, color, suffix = "" }: { label: string; value: number; total: number; color: string; suffix?: string }) { const percentage = total ? Math.min(100, Math.round((value / total) * 100)) : 0; return <div><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-900">{value}{suffix}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>; }
function ModerationList<T extends { id?: string }>({ title, empty, items, renderItem }: { title: string; empty: string; items: T[]; renderItem: (item: T) => React.ReactNode }) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><SectionHeading label="Moderation" title={title} /><div className="mt-5 space-y-3">{items.length ? items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-100 p-3">{renderItem(item)}</div>) : <p className="py-6 text-center text-sm text-slate-500">{empty}</p>}</div></div>; }
