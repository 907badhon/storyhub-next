import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";

export interface UserStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const postsQuery = query(
    collection(db, "posts"),
    where("authorId", "==", userId),
  );
  const postsSnap = await getDocs(postsQuery);

  const posts = postsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Post[];

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  let totalComments = 0;
  for (const post of posts) {
    const cq = query(
      collection(db, "comments"),
      where("postId", "==", post.id),
    );
    const cs = await getDocs(cq);
    totalComments += cs.docs.length;
  }

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalLikes,
    totalComments,
  };
}

export async function getRecentPosts(
  userId: string,
  count = 5,
): Promise<Post[]> {
  const q = query(collection(db, "posts"), where("authorId", "==", userId));
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];

  return posts
    .sort((a: any, b: any) => {
      const aT = a.createdAt?.seconds || 0;
      const bT = b.createdAt?.seconds || 0;
      return bT - aT;
    })
    .slice(0, count);
}

export async function getRecentComments(
  userId: string,
  count = 5,
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

  const allComments: any[] = [];
  for (const postId of postMap.keys()) {
    const cq = query(collection(db, "comments"), where("postId", "==", postId));
    const cs = await getDocs(cq);
    cs.docs.forEach((d) => {
      allComments.push({
        id: d.id,
        ...d.data(),
        postTitle: postMap.get(postId)?.title,
        postSlug: postMap.get(postId)?.slug,
      });
    });
  }

  return allComments
    .sort((a, b) => {
      const aT = a.createdAt?.seconds || 0;
      const bT = b.createdAt?.seconds || 0;
      return bT - aT;
    })
    .slice(0, count);
}
