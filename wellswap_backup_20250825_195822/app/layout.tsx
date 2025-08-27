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
  title: "WellSwap - Revolutionary Web3 Insurance Asset Trading Platform",
  description: "AI-powered insurance asset trading platform. Trade insurance products safely and efficiently in Hong Kong, Singapore, and global markets. Blockchain-based multisig security with real-time AI valuation.",
  keywords: "insurance assets, Web3, blockchain, AI valuation, Hong Kong insurance, Singapore insurance, multisig, insurance trading platform, DeFi, digital assets, smart contracts, BSC, Binance Smart Chain",
  authors: [{ name: "WellSwap Team" }],
  creator: "WellSwap",
  publisher: "WellSwap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
