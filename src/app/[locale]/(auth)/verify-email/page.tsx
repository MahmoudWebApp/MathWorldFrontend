import type { Metadata } from 'next';
import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm';
export const metadata: Metadata = {robots:{index:false,follow:false,nocache:true},referrer:'no-referrer'};
export default function Page(){return <EmailVerificationForm/>;}
