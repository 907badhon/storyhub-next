import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface Notification {
  id?: string;
  userId: string;
  type: "like" | "comment" | "reply" | "follow";
  actorId: string;
  actorName: string;
  actorUsername: string;
  actorPhotoURL: string;
  postId?: string;
  postSlug?: string;
  postTitle?: string;
  commentId?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export async function createNotification(
  data: Omit<Notification, "id" | "createdAt" | "read">,
): Promise<void> {
  if (data.userId === data.actorId) return;

  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Notification[];

  return items.sort((a: any, b: any) => {
    const aT = a.createdAt?.seconds || 0;
    const bT = b.createdAt?.seconds || 0;
    return bT - aT;
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs.filter((d) => !d.data().read).length;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}

export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  const unread = snap.docs.filter((d) => !d.data().read);

  await Promise.all(unread.map((d) => updateDoc(d.ref, { read: true })));
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await deleteDoc(doc(db, "notifications", notificationId));
}
