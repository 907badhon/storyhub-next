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
import { createNotification } from "./notifications";
import { UserProfile } from "@/types/user";

export async function followUser(
  followerId: string,
  followingId: string,
  followerProfile?: UserProfile,
): Promise<void> {
  if (followerId === followingId) return;

  const ref = collection(db, "follows");
  const q = query(ref, where("followerId", "==", followerId));
  const snap = await getDocs(q);

  const alreadyFollowing = snap.docs.some(
    (d) => d.data().followingId === followingId,
  );

  if (alreadyFollowing) return;

  await addDoc(ref, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", followerId), {
    followingCount: increment(1),
  });

  await updateDoc(doc(db, "users", followingId), {
    followersCount: increment(1),
  });

  if (followerProfile) {
    await createNotification({
      userId: followingId,
      type: "follow",
      actorId: followerId,
      actorName: followerProfile.name,
      actorUsername: followerProfile.username,
      actorPhotoURL: followerProfile.photoURL || "",
      message: `${followerProfile.name} started following you`,
    });
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  const ref = collection(db, "follows");
  const q = query(ref, where("followerId", "==", followerId));
  const snap = await getDocs(q);

  const matches = snap.docs.filter((d) => d.data().followingId === followingId);

  if (matches.length === 0) return;

  await Promise.all(matches.map((d) => deleteDoc(d.ref)));

  await updateDoc(doc(db, "users", followerId), {
    followingCount: increment(-1),
  });

  await updateDoc(doc(db, "users", followingId), {
    followersCount: increment(-1),
  });
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const ref = collection(db, "follows");
  const q = query(ref, where("followerId", "==", followerId));
  const snap = await getDocs(q);

  return snap.docs.some((d) => d.data().followingId === followingId);
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const ref = collection(db, "follows");
  const q = query(ref, where("followerId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data().followingId);
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const ref = collection(db, "follows");
  const q = query(ref, where("followingId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data().followerId);
}
