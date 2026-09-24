import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./config";
import { UserProfile } from "@/types/user";

export async function getPopularAuthors(count = 5): Promise<UserProfile[]> {
  const q = query(
    collection(db, "users"),
    orderBy("postsCount", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}
