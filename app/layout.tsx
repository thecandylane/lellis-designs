import type { Metadata } from "next";
import { Questrial, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/ui/Header";
import AmbassadorTracker from "@/components/AmbassadorTracker";
import { getThemeSettings } from "@/lib/theme";

export const dynamic = 'force-dynamic';

const questrial = Questrial({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L. Ellis Designs - Custom 3\" Buttons",
  description: "Custom 3\" buttons for every occasion. $5 each with bulk discounts for large orders. Louisiana-based with fast turnaround.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "L. Ellis Designs - Custom 3\" Buttons",
    description: "Custom 3\" buttons for every occasion. $5 each with bulk discounts for large orders. Louisiana-based with fast turnaround.",
    images: ["/logo.png"],
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${theme.primary_hsl};
              --secondary: ${theme.secondary_hsl};
              --accent: ${theme.accent_hsl};
            }
          `
        }} />
      </head>
      <body
        className={`${questrial.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AmbassadorTracker />
        </Suspense>
        <Header />
        {children}
      </body>
    </html>
  );
}
