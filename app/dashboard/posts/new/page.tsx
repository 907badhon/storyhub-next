"use client";

import { useState, FormEvent, useRef } from "react";
import { uploadImage } from "@/lib/cloudinary/storage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { createPost } from "@/lib/firebase/posts";
import { generateSlug } from "@/lib/utils/slug";
import RichTextEditor from "@/components/blog/RichTextEditor";

export default function NewPostPage() {
  const { user, profile, loading } = useProtectedRoute();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
  });

  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    const toastId = toast.loading("Uploading cover image...");

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

  const handleSubmit = async (e: FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      status === "draft" ? "Saving draft..." : "Publishing...",
    );

    try {
      await createPost({
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: coverImage,
        category: form.category.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        status,
        authorId: user.uid,
        authorName: profile.name,
        authorUsername: profile.username,
        authorPhotoURL: profile.photoURL || "",
        viewCount: 0,
        likesCount: 0,
        commentsCount: 0,
        publishedAt: status === "published" ? new Date() : null,
      });

      toast.success(status === "draft" ? "Draft saved!" : "Post published!", {
        id: toastId,
      });
      router.push("/dashboard?tab=posts");
    } catch (err: any) {
      console.error("Error saving post:", err);
      toast.error("Failed to save post", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
        <p className="text-gray-600 mt-2">
          Write a new post and share your knowledge with the world
        </p>
      </div>

      <form className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Cover Image
              </h2>

              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover preview"
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
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    JPG, PNG (max 5MB) · Recommended 1200x630
                  </p>
                </div>
              )}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="How to Learn Next.js"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL)
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /blog/{form.slug || "your-slug"}
            </p>
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
              placeholder="Short summary..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              disabled={saving}
            />
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={form.content}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, content: html }))
                }
                placeholder="Start writing your story..."
              />
            </div>
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
                placeholder="technology"
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
                placeholder="react, nextjs, tutorial"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
          </div>
        </div>


        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "draft")}
            disabled={saving}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "published")}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </form>
    </>
  );
}
