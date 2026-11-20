import type { Metadata } from 'next';
import PremiumBenefitsPage from '@/app/[locale]/premium/page';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudentUpgradePage() {
  // Same Free/Premium comparison and admin-issued-code activation, inside
  // the authenticated learner's dashboard route.
  return <PremiumBenefitsPage />;
}
