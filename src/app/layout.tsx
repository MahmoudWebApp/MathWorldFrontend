import { Outfit, Almarai } from 'next/font/google';
import '@/style/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${outfit.variable} ${almarai.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}