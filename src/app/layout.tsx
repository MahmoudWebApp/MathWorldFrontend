import { Alexandria } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

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
      { url: '/mathworld-mark-balanced-v4.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8ff' },
    { media: '(prefers-color-scheme: dark)', color: '#110c1e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={alexandria.variable}>
      <body className="min-h-screen bg-background antialiased brand-page-bg">{children}</body>
    </html>
  );
}
