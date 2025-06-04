import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { Chatbot } from '@/components/Chatbot'; // Import the Chatbot

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // Fallback for local dev

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: 'BallotBox - Election Management',
  description: 'Manage elections, candidates, and votes seamlessly with BallotBox. Your trusted platform for fair and transparent elections.',
  openGraph: {
    title: 'BallotBox - Election Management',
    description: 'Explore, manage, and participate in elections with BallotBox.',
    url: appBaseUrl,
    siteName: 'BallotBox',
    images: [
      {
        url: `${appBaseUrl}/og-image.png`, // Replace with your actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: 'BallotBox Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BallotBox - Election Management',
    description: 'Your platform for fair and transparent elections.',
    // creator: '@yourTwitterHandle', // Optional: add your Twitter handle
    images: [`${appBaseUrl}/twitter-image.png`], // Replace with your actual Twitter image URL
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
  icons: {
    icon: '/favicon.ico', // Ensure you have a favicon.ico in your public folder
    apple: '/apple-touch-icon.png', // Ensure you have an apple-touch-icon.png
  },
  // manifest: '/site.webmanifest', // Optional: If you have a web app manifest
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head />
      <body className="font-body antialiased flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Chatbot /> {/* Add Chatbot here */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
