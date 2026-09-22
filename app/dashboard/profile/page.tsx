// app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { uploadImage } from "@/lib/cloudinary/storage";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { user, profile, loading } = useProtectedRoute();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
  });

  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        twitter: profile.socialLinks?.twitter || "",
        github: profile.socialLinks?.github || "",
        linkedin: profile.socialLinks?.linkedin || "",
        website: profile.socialLinks?.website || "",
      });
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading photo...");

    try {
      const url = await uploadImage(file, "profiles", user.uid);
      setPhotoURL(url);
      toast.success("Photo uploaded! Don't forget to save.", { id: toastId });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Failed to upload photo", { id: toastId });
    } finally {
      setUploading(false);
      // Reset input যাতে same file আবার select করা যায়
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formData.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error(
        "Username can only contain letters, numbers, and underscores",
      );
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        photoURL: photoURL,
        socialLinks: {
          twitter: formData.twitter.trim(),
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          website: formData.website.trim(),
        },
      });

      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error("Failed to update profile", { id: toastId });
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-2">
          তোমার public profile তথ্য update করো
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-200"
      >
        {/* ============================
            PROFILE PHOTO
        ============================ */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Profile Photo
          </h2>

          <div className="flex items-center gap-6">
            {/* Preview */}
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-gray-200">
                {formData.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            {/* Upload button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Choose Photo"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Basic Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">@</span>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={saving}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                তোমার profile URL: /author/{formData.username || "username"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="নিজের সম্পর্কে কিছু লেখো..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length} characters
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Social Links
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter / X
              </label>
              <input
                name="twitter"
                type="url"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                name="github"
                type="url"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
