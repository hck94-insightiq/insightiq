export interface AnalysisOutput {
  primaryNiche: string;
  secondaryNiche: string;
  nuanceDescription: string;
  confidenceScore: number;

  audienceProfile: {
    gender: string;
    ageRange: string;
    purchasePower: string;
    genderBreakdown: {
      female: number;
      male: number;
      other: number;
    };
  };

  nicheBreakdown: Array<{
    niche: string;
    score: number;
  }>;

  postingTimeRecommendation: Array<{
    day: string;
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