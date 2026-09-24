"use client";

import { useState, useEffect, FormEvent, useRef, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getPostById, updatePost, deletePost } from "@/lib/firebase/posts";
import { uploadImage } from "@/lib/cloudinary/storage";
import { generateSlug } from "@/lib/utils/slug";
import RichTextEditor from "@/components/blog/RichTextEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = use(params);
  const { user, profile, loading } = useProtectedRoute();
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft" as "draft" | "published" | "archived",
  });

  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);

  // Post load করো
  useEffect(() => {
    async function load() {
      if (!user || !postId) return;
      try {
        const post = await getPostById(postId);
        if (!post) {
          toast.error("Post not found");
          router.push("/dashboard?tab=posts");
          return;
        }
        if (post.authorId !== user.uid) {
          toast.error("You can only edit your own posts");
          router.push("/dashboard?tab=posts");
          return;
        }

        setForm({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          category: post.category || "",
          tags: (post.tags || []).join(", "),
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          status: post.status || "draft",
        });
        setCoverImage(post.coverImage || "");
      } catch (err: any) {
        console.error("Load post error:", err);
        toast.error("Failed to load post");
      } finally {
        setLoadingPost(false);
      }
    }
    load();
  }, [user, postId, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "slug") {
      setSlugManuallyEdited(true);
      setForm((prev) => ({ ...prev, slug: value }));
      return;
    }

    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: slugManuallyEdited ? prev.slug : generateSlug(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover...");
    try {
      const url = await uploadImage(file, "covers", user.uid);
      setCoverImage(url);
      toast.success("Cover uploaded!", { id: toastId });
    } catch (err: any) {
      console.error("Cover upload error:", err);
      toast.error("Failed to upload cover", { id: toastId });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!postId) return;

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving...");

    try {
      const updates: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage,
        category: form.category.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        status: form.status,
      };

      await updatePost(postId, updates);
      toast.success("Post updated!", { id: toastId });
      router.push("/dashboard?tab=posts");
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error("Failed to update post", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    if (!confirm("Delete this post permanently?")) return;

    const toastId = toast.loading("Deleting...");
    try {
      await deletePost(postId);
      toast.success("Post deleted", { id: toastId });
      router.push("/dashboard?tab=posts");
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (loading || loadingPost) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-gray-600 mt-2">Post update করো</p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition"
        >
          Delete Post
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={saving}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Cover */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
          {coverImage ? (
            <div className="relative">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-56 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-12 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition disabled:opacity-50"
              >
                {uploadingCover ? "Uploading..." : "+ Choose Cover Image"}
              </button>
            </div>
          )}
        </div>

        {/* Basic */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">URL: /blog/{form.slug}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              content={form.content}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, content: html }))
              }
              placeholder="Start writing..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              name="seoTitle"
              value={form.seoTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Description
            </label>
            <textarea
              name="seoDescription"
              value={form.seoDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard?tab=posts")}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingCover}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
