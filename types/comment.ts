export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userPhotoURL: string;
  content: string;
  parentId: string | null;
  likesCount: number;
  createdAt: any;
  updatedAt: any;
}
