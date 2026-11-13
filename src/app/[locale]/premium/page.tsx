import { Link } from '@/i18n/routing';

export default function PremiumInformationPage() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-5 text-3xl font-bold">MathWorld Premium</h1>
      <div className="space-y-4 rounded-2xl border bg-card p-7">
        <p>Premium unlocks all mathematics categories, unlimited practice, and solutions before answering.</p>
        <p dir="rtl">يتيح Premium جميع فئات الرياضيات، وحل مسائل دون حد يومي، وعرض الحل قبل الإجابة.</p>
        <p className="text-sm text-muted-foreground">
          Online checkout is not available yet. Subscription grants are currently managed by administrators.
        </p>
        <p dir="rtl" className="text-sm text-muted-foreground">
          الدفع الإلكتروني غير متاح حالياً. يمكن للإدارة تفعيل الاشتراكات إلى حين إطلاق الدفع.
        </p>
        <Link href="/stages" className="inline-flex rounded-lg border px-4 py-2">
          Browse stages / تصفح المراحل
        </Link>
      </div>
    </main>
  );
}
