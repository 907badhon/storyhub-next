import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Post } from "@/types/post";
import { UserProfile } from "@/types/user";

export async function searchPosts(term: string): Promise<Post[]> {
  if (!term.trim()) return [];

  const q = query(collection(db, "posts"), where("status", "==", "published"));
  const snap = await getDocs(q);

  const lower = term.toLowerCase();
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];

  return posts.filter((p) => {
    const inTitle = p.title?.toLowerCase().includes(lower);
    const inExcerpt = p.excerpt?.toLowerCase().includes(lower);
    const inTags = p.tags?.some((t) => t.toLowerCase().includes(lower));
    const inCategory = p.category?.toLowerCase().includes(lower);
    return inTitle || inExcerpt || inTags || inCategory;
  });
}

export async function searchAuthors(term: string): Promise<UserProfile[]> {
  if (!term.trim()) return [];

  const snap = await getDocs(collection(db, "users"));
  const lower = term.toLowerCase();

  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => {
      const inName = u.name?.toLowerCase().includes(lower);
      const inUsername = u.username?.toLowerCase().includes(lower);
      const inBio = u.bio?.toLowerCase().includes(lower);
      return inName || inUsername || inBio;
    });
}
