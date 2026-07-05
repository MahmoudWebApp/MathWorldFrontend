// app/[locale]/layout.tsx
import { Outfit, Almarai } from "next/font/google";
import { getTranslations } from "next-intl/server";
import "@/style/globals.css";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${outfit.variable} ${almarai.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background antialiased"
       data-gramm="false"        
        data-gramm_editor="false"  
        data-enable-grammarly="false" 
      >{children}</body>
    </html>
  );
}
