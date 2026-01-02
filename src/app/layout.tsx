import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopHeader } from "@/components/layout/top-header";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { NextAuthProvider } from "@/providers/next-auth-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "GateSIM - Global Travel eSIM",
    template: "%s | GateSIM",
  },
  description: "Хаашаа ч явсан, GateSIM-тэй. Your Gateway to Global Connection. Affordable eSIM data plans for 200+ countries.",
  keywords: ["eSIM", "travel", "internet", "roaming", "data", "5G", "4G", "cheap data"],
  authors: [{ name: "GateSIM Team" }],
  creator: "GateSIM",
  metadataBase: new URL("https://gatesim.travel"),
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: "https://gatesim.travel",
    title: "GateSIM - Global Travel eSIM",
    description: "Хаашаа ч явсан, GateSIM-тэй. Instant connectivity in 200+ countries.",
    siteName: "GateSIM",
  },
  twitter: {
    card: "summary_large_image",
    title: "GateSIM - Global Travel eSIM",
    description: "Your Gateway to Global Connection. Affordable eSIM plans worldwide.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}

        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GateSIM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}>
        <NextAuthProvider>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>
                {/* Desktop & Mobile Header */}
                <div className="relative z-50">
                  <TopHeader />
                </div>
                <div className="app-container min-h-screen relative z-10 pb-24 md:pb-0">
                  {children}
                </div>
                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <BottomNav />
                </div>
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
