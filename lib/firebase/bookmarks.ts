import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function addBookmark(
  postId: string,
  userId: string,
): Promise<void> {
  const ref = collection(db, "bookmarks");
  const q = query(ref, where("userId", "==", userId));
  const snap = await getDocs(q);

  const alreadyBookmarked = snap.docs.some((d) => d.data().postId === postId);

  if (alreadyBookmarked) return;

  await addDoc(ref, {
    postId,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function removeBookmark(
  postId: string,
  userId: string,
): Promise<void> {
  const ref = collection(db, "bookmarks");
  const q = query(ref, where("userId", "==", userId));
  const snap = await getDocs(q);

  const matches = snap.docs.filter((d) => d.data().postId === postId);

  if (matches.length === 0) return;

  await Promise.all(matches.map((d) => deleteDoc(d.ref)));
}

export async function hasUserBookmarkedPost(
  postId: string,
  userId: string,
): Promise<boolean> {
  const ref = collection(db, "bookmarks");
  const q = query(ref, where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.some((d) => d.data().postId === postId);
}

export async function getUserBookmarks(userId: string): Promise<string[]> {
  const ref = collection(db, "bookmarks");
  const q = query(ref, where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data().postId);
}
