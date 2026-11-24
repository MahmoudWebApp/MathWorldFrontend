import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/PasswordRecoveryForms';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true }, referrer: 'no-referrer' };
export default function Page() { return <ForgotPasswordForm />; }
