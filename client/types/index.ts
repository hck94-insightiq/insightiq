import { DefaultSession } from "next-auth";

export type Role = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

export interface PostingDay {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  avgViews: number;
  count: number;
}

export interface EngagementBreakdown {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface Account {
  _id: string;
  userId: string;
  tiktokUsername: string;
  nickName: string;
  contentDescription: string;
  followers: number;
  following: number;
  totalVideos: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  hashtags: string[];
  postingDays: PostingDay[];
  engagementBreakdown: EngagementBreakdown;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudienceProfile {
  gender: string;
  ageRange: string;
  purchasePower: string;
}

export interface Recommendation {
  category: string;
  priceRange: string;
  matchScore: number;
  reason: string;
  examples: string[];
}

export interface Analysis {
  _id: string;
  userId: string;
  accountId: string;
  primaryNiche: string;
  secondaryNiche: string;
  nuanceDescription: string;
  audienceProfile: AudienceProfile;
  confidenceScore: number;
  recommendations: Recommendation[];
  createdAt: Date;
}

export interface AnalysisOutput {
  primaryNiche: string;
  secondaryNiche: string;
  nuanceDescription: string;
  confidenceScore: number;

  audienceProfile: {
    ageRange: string;
    purchasePower: string;
  };

  nicheBreakdown: Array<{
    niche: string;
    score: number;
  }>;

  recommendations: Array<{
    category: string;
    priceRange: string;
    matchScore: number;
    reason: string;
    examples: string[];
  }>;
}

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
