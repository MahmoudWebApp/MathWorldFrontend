'use client';

import { type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Crown, LockKeyhole, ChartNoAxesCombined, BookOpenCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/Dialog';

interface LockedPremiumDialogProps {
  children: ReactNode;
  topicName?: string;
}

/** Accessible, shared paywall explanation. Never grants access in the client. */
export function LockedPremiumDialog({ children, topicName }: LockedPremiumDialogProps) {
  const ar = useLocale() === 'ar';
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[min(94vw,30rem)] rounded-3xl p-5 sm:p-7">
        <DialogHeader>
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <DialogTitle className="text-xl font-extrabold leading-8">
            {ar ? 'هذه الميزة متاحة لحساب Premium' : 'This feature is for Premium learners'}
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-7">
            {topicName
              ? (ar ? `فئة «${topicName}» متاحة عند ترقية حسابك.` : `Upgrade to access the “${topicName}” topic.`)
              : (ar ? 'تعرّف إلى المزايا التي يمكن فتحها عند الترقية.' : 'Explore the additional benefits available with Premium.')}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm">
          <li className="flex items-start gap-3"><BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {ar ? 'فتح فئات مرحلتك وحل مسائل غير محدودة' : 'Unlock the topics in your stage, with unlimited practice'}</li>
          <li className="flex items-start gap-3"><Crown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {ar ? 'مشاهدة الحل قبل إرسال الإجابة' : 'View solutions before answering'}</li>
          <li className="flex items-start gap-3"><ChartNoAxesCombined className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {ar ? 'إحصائيات وتقارير شخصية متقدمة' : 'Personal analytics and progress reports'}</li>
        </ul>
        <Link href="/dashboard/upgrade" className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-90">
          {ar ? 'عرض المميزات وترقية الحساب' : 'See benefits and upgrade'}
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          {ar ? 'التفعيل حالياً بكود من الإدارة، دون عرض أسعار.' : 'Activation currently uses an admin-issued code. No prices are shown.'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
