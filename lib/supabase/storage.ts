import { supabase } from "./config";

export async function uploadImage(
  file: File,
  folder: string, // "profiles", "covers", "blog-content"
  userId: string,
): Promise<string> {
  // 1. File extension বের করো
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // 2. Supabase Storage এ upload করো
  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(error.message);
  }

  // 3. Public URL আনো
  const { data: urlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from("blog-images")
    .remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(error.message);
  }
}
