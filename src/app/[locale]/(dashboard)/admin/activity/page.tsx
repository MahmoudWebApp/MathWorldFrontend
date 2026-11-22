import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

// Legacy student-monitoring URL: keep one student-only destination, never
// a second screen that diverges from the canonical event timeline.
export default async function RedirectLegacyStudentActivity() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/engagement/students`);
}
