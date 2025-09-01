import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../providers/web3";
import SupabaseKeepAlive from "../components/SupabaseKeepAlive";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp", 
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WellSwap - Premium Insurance Trading Platform",
  description: "AI-powered Web3 insurance asset trading with premium glassmorphism UI design. Blockchain security, real-time AI valuation, and mobile-optimized PWA experience.",
  keywords: "insurance assets, Web3, blockchain, AI valuation, PWA, mobile trading, glassmorphism, premium UI, multisig, insurance trading platform, DeFi, digital assets, smart contracts, Polygon",
  authors: [{ name: "WellSwap Team" }],
  creator: "WellSwap",
  publisher: "WellSwap",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WellSwap",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wellswap.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "WellSwap - Revolutionary Web3 Insurance Asset Trading Platform",
    description: "AI-powered insurance asset trading platform. Trade insurance products safely and efficiently in Hong Kong, Singapore, and global markets with blockchain-based multisig security.",
    url: 'https://wellswap.netlify.app',
    siteName: 'WellSwap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WellSwap - Web3 Insurance Asset Trading Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "WellSwap - Revolutionary Web3 Insurance Asset Trading Platform",
    description: "AI-powered insurance asset trading platform with blockchain-based multisig security and real-time AI valuation.",
    images: ['/og-image.png'],
    creator: '@wellswap',
    site: '@wellswap',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Finance',
  classification: 'Insurance Trading Platform',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoSansSC.variable} ${notoSansJP.variable} antialiased font-inter`}
      >
        <Web3Provider>
          <SupabaseKeepAlive />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
