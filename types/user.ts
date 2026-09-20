// types/user.ts

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  photoURL: string;
  role: "user" | "author" | "admin";
  followersCount: number;
  followingCount: number;
  postsCount: number;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: Date | null;
}
