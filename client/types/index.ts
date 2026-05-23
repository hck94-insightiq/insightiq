//untuk types menyimpan semua type yang digunakan di project ini, agar lebih mudah untuk maintain dan import di file lain dan menghindari circular dependency, untuk cara importnya cukup import dari file ini saja, contoh : import { User, Account } from '@/types';

export type Role = "user" | "admin";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: Date;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Account {
  _id?: string;
  userId: string;
  tiktokUsername: string;
  followers: number;
  following: number;
  totalVideos: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  primaryNiche: string;
  hashtags: string[];
  contentDescription: string;
  priceRange: PriceRange;
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
  _id?: string;
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

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
