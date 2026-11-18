export type StageCategory = {
  id: number;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
  isFree: boolean;
};

export type StageCategoryAccess = {
  stageId: number;
  categories: StageCategory[];
  freeCategoryIds: number[];
  freeCategoryCount: number;
  dailyProblemLimit: number | null;
  groupsHaveVariableSizes: boolean;
};

export type SubscriptionTier = "Free" | "Premium";

export function canOpenCategory(
  category: StageCategory,
  tier: SubscriptionTier,
): boolean {
  return tier === "Premium" || category.isFree;
}

export async function fetchStageCategoryAccess(
  apiBaseUrl: string,
  stageId: number,
  signal?: AbortSignal,
): Promise<StageCategoryAccess> {
  if (!Number.isSafeInteger(stageId) || stageId <= 0) {
    throw new Error("Invalid stage ID");
  }
  const base = apiBaseUrl.replace(/\/$/, "");
  const response = await fetch(
    `${base}/api/stages/${stageId}/free-categories`,
    { method: "GET", cache: "no-store", signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to load stage categories (${response.status})`);
  }
  const data: StageCategoryAccess = await response.json();
  if (data.stageId !== stageId || !Array.isArray(data.categories)) {
    throw new Error("Invalid category access response");
  }
  return data;
}
