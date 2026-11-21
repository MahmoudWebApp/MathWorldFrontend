import { redirect } from 'next/navigation';

// The public website is a curriculum guide, not a searchable problem catalogue.
// Learners continue to use /dashboard/problems in their private workspace.
export default async function PublicProblemsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/stages`);
}
