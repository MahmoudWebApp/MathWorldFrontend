"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { LockKeyhole } from "lucide-react";
import { StageIconBadge } from "@/components/stages/StageIconBadge";

interface StudentStageAccessNoticeProps {
  selectedStageId?: number | null;
  requestedStageId?: number | null;
}

/**
 * A stage choice is a learner preference, not a silent redirect. Never
 * let another-stage cards or direct URLs become an alternative way to
 * change that preference. Admin and public browsing remain unrestricted.
 */
export function StudentStageAccessNotice({
  selectedStageId,
  requestedStageId,
}: StudentStageAccessNoticeProps) {
  const ar = useLocale() === "ar";
  return (
    <section
      role="status"
      className="container mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        <LockKeyhole className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-balance text-2xl font-extrabold text-foreground sm:text-3xl">
        {ar ? "هذه ليست مرحلتك التعليمية الحالية" : "This isn't your current learning stage"}
      </h1>
      <p className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
        {ar
          ? "مسائل الطالب وفئاته مرتبطة بمرحلته المختارة. إذا بدك تنتقل لمرحلة ثانية، غيّر مرحلتك أولاً من الإعدادات."
          : "Your topics and practice follow your selected stage. To study another stage, change your learning stage first."}
      </p>
      {selectedStageId != null && selectedStageId > 0 && (
        <Link
          href={`/stages/${selectedStageId}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground"
        >
          <StageIconBadge stage={{ Id: selectedStageId }} size="xs" className="border-0 bg-transparent shadow-none" />
          {ar ? "الرجوع لفئات مرحلتي" : "Go to my stage topics"}
        </Link>
      )}
      <Link
        href="/learning-stage"
        className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-5 py-2.5 font-semibold text-foreground hover:bg-muted/70"
      >
        {ar ? "تغيير المرحلة التعليمية" : "Change learning stage"}
      </Link>
    </section>
  );
}
