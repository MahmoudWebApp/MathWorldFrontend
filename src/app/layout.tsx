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
      { url: '/mathworld-favicon-v4.ico?v=5', sizes: 'any' },
      { url: '/mathworld-favicon-32-v4.png?v=5', sizes: '32x32', type: 'image/png' },
      { url: '/mathworld-favicon-16-v4.png?v=5', sizes: '16x16', type: 'image/png' },
      { url: '/mathworld-launcher-v6.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/mathworld-apple-v4.png?v=5', sizes: '180x180', type: 'image/png' }],
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
