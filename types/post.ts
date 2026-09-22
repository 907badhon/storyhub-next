export interface Post {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published" | "archived";
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhotoURL: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  updatedAt: any;
  publishedAt: any;
}
