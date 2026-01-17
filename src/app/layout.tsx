import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { NextAuthProvider } from "@/providers/next-auth-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { PresenceProvider } from "@/components/providers/presence-provider";

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
        {/* Theme script - runs BEFORE React hydration to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('gatesim-mode');
                  if (mode === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Facebook In-App Browser Detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var ua = navigator.userAgent || navigator.vendor || window.opera || '';
                  var isFB = /FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua);
                  if (isFB) {
                    document.documentElement.setAttribute('data-fb-browser', 'true');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Service Worker Nuker - Fixes stuck CSP headers from old SW */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log('Unregistered stuck service worker');
                    }
                  });
                }
                if ('caches' in window) {
                   caches.keys().then(function(names) {
                     for (let name of names) caches.delete(name);
                     console.log('Cleared all caches');
                   });
                }
              })();
            `,
          }}
        />
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
            <LanguageProvider>
              <ThemeProvider>
                <ToastProvider>
                  <PresenceProvider>
                    <ClientLayout>
                      {children}
                    </ClientLayout>
                  </PresenceProvider>
                </ToastProvider>
              </ThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
