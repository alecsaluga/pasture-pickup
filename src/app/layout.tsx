import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Pasture Pickup - Find Local Livestock Removal Services',
    template: '%s | Pasture Pickup'
  },
  description: 'Find trusted livestock removal services nationwide. Connect with licensed providers for dead horse removal, cattle removal, and emergency livestock services. Available 24/7.',
  keywords: [
    'livestock removal',
    'dead horse removal',
    'dead cattle removal',
    'emergency livestock removal',
    'farm cleanup services',
    'animal removal services',
    'livestock disposal',
    'dead animal removal'
  ],
  authors: [{ name: 'Pasture Pickup' }],
  creator: 'Pasture Pickup',
  publisher: 'Pasture Pickup',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pasturepickup.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://pasturepickup.com',
    siteName: 'Pasture Pickup',
    title: 'Pasture Pickup - Find Local Livestock Removal Services',
    description: 'Find trusted livestock removal services nationwide. Connect with licensed providers for dead horse removal, cattle removal, and emergency livestock services. Available 24/7.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pasture Pickup - Livestock Removal Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasture Pickup - Find Local Livestock Removal Services',
    description: 'Find trusted livestock removal services nationwide. Connect with licensed providers for dead horse removal, cattle removal, and emergency livestock services. Available 24/7.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Pasture Pickup",
              "description": "National directory of livestock removal services",
              "url": process.env.NEXT_PUBLIC_APP_URL || 'https://pasturepickup.com',
              "logo": `${process.env.NEXT_PUBLIC_APP_URL || 'https://pasturepickup.com'}/logo.png`,
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-234-567-8900",
                "contactType": "customer service",
                "availableLanguage": "English"
              },
              "areaServed": {
                "@type": "Country",
                "name": "United States"
              },
              "serviceType": "Livestock Removal Services"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
