"use client";

import { useEffect, useState } from "react";
import {
  canOpenCategory,
  fetchStageCategoryAccess,
  type StageCategoryAccess,
  type SubscriptionTier,
} from "./category-access";

type Props = {
  apiBaseUrl: string;
  stageId: number;
  tier: SubscriptionTier;
  locale: "ar" | "en";
  onOpenCategory: (categoryId: number) => void;
  onUpgrade?: () => void;
};

export function StageCategoryAccessGrid({
  apiBaseUrl,
  stageId,
  tier,
  locale,
  onOpenCategory,
  onUpgrade,
}: Props) {
  const [data, setData] = useState<StageCategoryAccess | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const ar = locale === "ar";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData(null);
    fetchStageCategoryAccess(apiBaseUrl, stageId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [apiBaseUrl, stageId]);

  if (loading) return <p role="status">{ar ? "جارٍ تحميل الفئات…" : "Loading categories…"}</p>;
  if (error || !data) return <p role="alert">{ar ? "تعذّر تحميل الفئات." : "Could not load categories."}</p>;

  return (
    <section dir={ar ? "rtl" : "ltr"} aria-label={ar ? "فئات الرياضيات" : "Math categories"}>
      <p className="mb-4 text-sm text-gray-600">
        {tier === "Premium"
          ? ar ? "Premium: جميع الفئات متاحة، دون حد يومي." : "Premium: all categories, no daily limit."
          : ar ? "Free: فئتان مجانيتان لكل مرحلة، دون حد يومي للمسائل." : "Free: two categories per stage, unlimited daily practice."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.categories.map((category) => {
          const unlocked = canOpenCategory(category, tier);
          return (
            <div key={category.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <span aria-hidden="true">{category.icon}</span>
                <span className="text-xs">{unlocked ? ar ? "متاحة" : "Unlocked" : ar ? "مقفلة" : "Locked"}</span>
              </div>
              <h3 className="my-3 font-semibold">{ar ? category.nameAr : category.nameEn}</h3>
              {unlocked ? (
                <button type="button" className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
                  onClick={() => onOpenCategory(category.id)}>
                  {ar ? "ابدأ الحل" : "Start solving"}
                </button>
              ) : (
                <button type="button" className="rounded-lg border px-4 py-2"
                  disabled={!onUpgrade} onClick={onUpgrade}>
                  {ar ? "افتح مع Premium" : "Unlock with Premium"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
