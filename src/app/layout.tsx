import { Alexandria } from 'next/font/google';
import type { Metadata } from 'next';

import '@/style/globals.css';

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-alexandria',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MathWorld',
    template: '%s | MathWorld',
  },
  description: 'Learn, practice, and master mathematics with MathWorld.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/mathworld-favicon-v2.ico', sizes: 'any' },
      { url: '/mathworld-favicon-32-v2.png', sizes: '32x32', type: 'image/png' },
      { url: '/mathworld-favicon-16-v2.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={alexandria.variable}>
      <body className="min-h-screen bg-background antialiased brand-page-bg">{children}</body>
    </html>
  );
}
