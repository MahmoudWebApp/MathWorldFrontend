'use client';

import { type ReactNode, useState } from 'react';
import { useLocale } from 'next-intl';
import { LockKeyhole } from 'lucide-react';
import { getPremiumBenefits } from '@/lib/premium-benefits';
import { useGetCustomExamAvailabilityQuery } from '@/store/api/usersApi';
import { Link } from '@/i18n/routing';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/Dialog';

interface LockedPremiumDialogProps {
  children: ReactNode;
  topicName?: string;
  featureName?: string;
}

/** Accessible, shared paywall explanation. Never grants access in the client. */
export function LockedPremiumDialog({ children, topicName, featureName }: LockedPremiumDialogProps) {
  const ar = useLocale() === 'ar';
  const [open,setOpen]=useState(false);
  const {currentData:exams}=useGetCustomExamAvailabilityQuery(undefined,{skip:!open});
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[min(94vw,30rem)] rounded-3xl p-5 sm:p-7">
        <DialogHeader>
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <DialogTitle className="text-xl font-extrabold leading-8">
            {ar ? 'مميزات Premium' : 'Premium benefits'}
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-7">
            {featureName
              ? (ar ? `ميزة «${featureName}» متاحة بعد ترقية حسابك.` : `Upgrade to unlock “${featureName}”.`)
              : topicName
              ? (ar ? `فئة «${topicName}» متاحة عند ترقية حسابك.` : `Upgrade to access the “${topicName}” topic.`)
              : (ar ? 'تعرّف إلى المزايا التي يمكن فتحها عند الترقية.' : 'Explore the additional benefits available with Premium.')}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm">
          {getPremiumBenefits(exams?.Enabled===true).map(({id,icon:Icon,ar:titleAr,en:titleEn})=><li key={id} className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary"/><span>{ar?titleAr:titleEn}</span></li>)}
        </ul>
        <Link href="/dashboard/upgrade" className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-90">
          {ar ? 'عرض المميزات وترقية الحساب' : 'See benefits and upgrade'}
        </Link>
      </DialogContent>
    </Dialog>
  );
}
