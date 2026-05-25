import { DefaultSession } from "next-auth";

// Auth & User

export type Role = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

// Account (data TikTok dari Apify)

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

// AI Analysis (Gemini)

export interface AudienceProfile {
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
  confidenceScore: number;
  audienceProfile: AudienceProfile;
  nicheBreakdown: Array<{ niche: string; score: number }>;
  recommendations: Recommendation[];
  createdAt: Date;
}

export interface AnalysisOutput {
  primaryNiche: string;
  secondaryNiche: string;
  nuanceDescription: string;
  confidenceScore: number;
  audienceProfile: AudienceProfile;
  nicheBreakdown: Array<{ niche: string; score: number }>;
  recommendations: Recommendation[];
}

// NextAuth module augmentation

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
