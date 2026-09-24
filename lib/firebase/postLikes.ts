import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export async function likePost(postId: string, userId: string): Promise<void> {
  const likesRef = collection(db, "postLikes");
  const q = query(likesRef, where("postId", "==", postId));
  const snap = await getDocs(q);

  const alreadyLiked = snap.docs.some((d) => d.data().userId === userId);

  if (alreadyLiked) return;

  await addDoc(likesRef, {
    postId,
    userId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "posts", postId), {
    likesCount: increment(1),
  });
}

export async function unlikePost(
  postId: string,
  userId: string,
): Promise<void> {
  const likesRef = collection(db, "postLikes");
  const q = query(likesRef, where("postId", "==", postId));
  const snap = await getDocs(q);

  const userLikes = snap.docs.filter((d) => d.data().userId === userId);

  if (userLikes.length === 0) return;

  await Promise.all(userLikes.map((d) => deleteDoc(d.ref)));

  await updateDoc(doc(db, "posts", postId), {
    likesCount: increment(-1),
  });
}

export async function hasUserLikedPost(
  postId: string,
  userId: string,
): Promise<boolean> {
  const likesRef = collection(db, "postLikes");
  const q = query(likesRef, where("postId", "==", postId));
  const snap = await getDocs(q);

  return snap.docs.some((d) => d.data().userId === userId);
}
