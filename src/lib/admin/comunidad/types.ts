export type CommunityPostType =
  | "article"
  | "case"
  | "event"
  | "question"
  | "resource";

export type CommunityPostStatus =
  | "published"
  | "hidden"
  | "reported"
  | "removed";

export interface CommunityPostListItem {
  id: string;
  authorName: string;
  title: string;
  type: CommunityPostType;
  reportsCount: number;
  commentsCount: number;
  status: CommunityPostStatus;
  createdAt: string;
}

export interface CommunityPostDetail extends CommunityPostListItem {
  authorId: string;
  content: string;
}

export interface CommunityPostsResponse {
  posts: CommunityPostListItem[];
}

export interface CommunityFilters {
  type?: CommunityPostType | "all";
  status?: CommunityPostStatus | "all";
  search?: string;
}

export type CommunityActionType = "hide" | "delete" | "warn" | "suspend";

export interface CommunityActionPayload {
  type: CommunityActionType;
  reason?: string;
}
