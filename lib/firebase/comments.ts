import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { Comment } from "@/types/comment";

export async function addComment(
  data: Omit<Comment, "id" | "createdAt" | "updatedAt" | "likesCount">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "comments"), {
    ...data,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateComment(
  commentId: string,
  content: string,
): Promise<void> {
  await updateDoc(doc(db, "comments", commentId), {
    content,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  const repliesQuery = query(
    collection(db, "comments"),
    where("parentId", "==", commentId),
  );
  const repliesSnap = await getDocs(repliesQuery);

  await Promise.all(repliesSnap.docs.map((d) => deleteDoc(d.ref)));

  await deleteDoc(doc(db, "comments", commentId));
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const q = query(collection(db, "comments"), where("postId", "==", postId));
  const snap = await getDocs(q);
  const comments = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Comment[];

  return comments.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return aTime - bTime;
  });
}

export async function likeComment(
  commentId: string,
  userId: string,
): Promise<void> {
  const likesRef = collection(db, "commentLikes");
  const q = query(likesRef, where("commentId", "==", commentId));
  const snap = await getDocs(q);

  const alreadyLiked = snap.docs.some((d) => d.data().userId === userId);

  if (alreadyLiked) return;

  await addDoc(likesRef, {
    commentId,
    userId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "comments", commentId), {
    likesCount: increment(1),
  });
}

export async function unlikeComment(
  commentId: string,
  userId: string,
): Promise<void> {
  const likesRef = collection(db, "commentLikes");
  const q = query(likesRef, where("commentId", "==", commentId));
  const snap = await getDocs(q);

  const userLikes = snap.docs.filter((d) => d.data().userId === userId);

  if (userLikes.length === 0) return;

  await Promise.all(userLikes.map((d) => deleteDoc(d.ref)));

  await updateDoc(doc(db, "comments", commentId), {
    likesCount: increment(-1),
  });
}

export async function getUserCommentLikes(
  userId: string,
  commentIds: string[],
): Promise<string[]> {
  if (commentIds.length === 0) return [];

  const likesRef = collection(db, "commentLikes");
  const q = query(likesRef, where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => d.data().commentId)
    .filter((id) => commentIds.includes(id));
}

export async function incrementCommentLikes(
  commentId: string,
  amount: number,
): Promise<void> {
  await updateDoc(doc(db, "comments", commentId), {
    likesCount: increment(amount),
  });
}

export async function deletePostComments(postId: string): Promise<void> {
  const q = query(collection(db, "comments"), where("postId", "==", postId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function getCommentsOnUserPosts(
  userId: string,
): Promise<(Comment & { postTitle?: string; postSlug?: string })[]> {
  const postsQuery = query(
    collection(db, "posts"),
    where("authorId", "==", userId),
  );
  const postsSnap = await getDocs(postsQuery);

  if (postsSnap.empty) return [];

  const postMap = new Map<string, { title: string; slug: string }>();
  postsSnap.docs.forEach((d) => {
    postMap.set(d.id, {
      title: d.data().title,
      slug: d.data().slug,
    });
  });

  const commentsRef = collection(db, "comments");
  const allComments: (Comment & { postTitle?: string; postSlug?: string })[] =
    [];

  for (const postId of postMap.keys()) {
    const q = query(commentsRef, where("postId", "==", postId));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data();
      allComments.push({
        id: d.id,
        ...data,
        postTitle: postMap.get(postId)?.title,
        postSlug: postMap.get(postId)?.slug,
      } as any);
    });
  }

  return allComments.sort((a: any, b: any) => {
    const aT = a.createdAt?.seconds || 0;
    const bT = b.createdAt?.seconds || 0;
    return bT - aT;
  });
}
