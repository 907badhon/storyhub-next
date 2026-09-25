import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { Post } from "@/types/post";

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePost(
  postId: string,
  data: Partial<Post>,
): Promise<void> {
  await updateDoc(doc(db, "posts", postId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, "posts", postId));
}

export function getPostActionError(error: unknown, action: "update" | "delete") {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";

  if (code === "permission-denied") {
    return `You do not have permission to ${action} this post. Check your Firestore rules and post ownership.`;
  }
  if (code === "unauthenticated") {
    return "Your session has expired. Please log in again.";
  }
  return `Failed to ${action} post. Please try again.`;
}

export async function getPostById(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(collection(db, "posts"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Post;
}

export async function getPublishedPosts(count = 10): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("authorId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
}

export async function incrementViewCount(postId: string): Promise<void> {
  try {
    // Firestore এর post এ count বাড়াও (author হলে কাজ করবে)
    await updateDoc(doc(db, "posts", postId), {
      viewCount: increment(1),
    });
  } catch (err: any) {
    // Permission deny হলে ignore করো (view count critical না)
    if (err.code === "permission-denied") {
      console.log("View count skipped (no permission)");
      return;
    }
    throw err;
  }
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("category", "==", category),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("tags", "array-contains", tag),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
}
export async function getTrendingPosts(count = 5): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    orderBy("viewCount", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
}
