/**
 * Student subscription capabilities shared by web screens.
 * Display hints never replace backend authorization.
 */
export type SubscriptionType = "Free" | "Premium";

export interface StudentEntitlement {
  SubscriptionType: SubscriptionType;
  IsPremium: boolean;
  PremiumExpiresAtUtc?: string | null;
  DailyNewProblemsLimit?: number | null;
  CanRevealSolutionBeforeAnswer: boolean;
  CanExportAnalytics: boolean;
  AdsEligible: boolean;
}

export interface PremiumSolution {
  ProblemId: number;
  CorrectOptionId: number | null;
  DetailedSolution: string | null;
  YoutubeSolutionUrl: string | null;
}

export interface LaunchFeatures {
  PaidCheckoutEnabled: boolean;
  CouponRedemptionEnabled: boolean;
  TutorMarketplaceEnabled: boolean;
  AdsEnabled: boolean;
  GeometryInteractiveEnabled: boolean;
  NotificationsEnabled: boolean;
}

type ApiEnvelope<T> = { Data: T };
const endpoint = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

async function getJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(`MathWorld API request failed (${response.status})`);
  }
  return (await response.json() as ApiEnvelope<T>).Data;
}

export const getStudentEntitlement = (baseUrl: string, token: string) =>
  getJson<StudentEntitlement>(endpoint(baseUrl, "/api/users/subscription"), token);

export const getPremiumSolution = (
  baseUrl: string,
  token: string,
  problemId: number,
) => {
  if (!Number.isSafeInteger(problemId) || problemId < 1) {
    throw new Error("Invalid problem ID");
  }
  return getJson<PremiumSolution>(
    endpoint(baseUrl, `/api/problems/${problemId}/premium-solution`),
    token,
  );
};

export const getLaunchFeatures = (baseUrl: string) =>
  getJson<LaunchFeatures>(endpoint(baseUrl, "/api/config/features"));
