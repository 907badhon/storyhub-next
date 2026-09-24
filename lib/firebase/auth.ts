// lib/firebase/auth.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signInWithRedirect,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function signUpUser(
  email: string,
  password: string,
  name: string,
  username: string,
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await sendEmailVerification(user);

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    name: name,
    username: username,
    bio: "",
    photoURL: user.photoURL || "",
    role: "user",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    socialLinks: {},
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<"popup" | "redirect"> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const userCredential = await signInWithPopup(auth, provider);
    await ensureUserProfile(userCredential.user);
    return "popup";
  } catch (error: any) {
    if (error.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return "redirect";
    }
    throw error;
  }
}

export async function completeGoogleRedirect() {
  const result = await getRedirectResult(auth);
  if (!result) return null;

  await ensureUserProfile(result.user);
  return result.user;
}

async function ensureUserProfile(user: User) {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      username: user.email?.split("@")[0] || "",
      bio: "",
      photoURL: user.photoURL || "",
      role: "user",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      socialLinks: {},
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserData(uid: string) {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data();
  }
  return null;
}
