import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from './components/nav';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s | Anvara',
  },
  description:
    'Connect sponsors with premium publishers. Create campaigns, manage ad slots, and grow your reach through targeted sponsorship placements.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Connect sponsors with premium publishers. Create campaigns, manage ad slots, and grow your reach.',
    type: 'website',
    siteName: 'Anvara',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Connect sponsors with premium publishers. Create campaigns, manage ad slots, and grow your reach.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
