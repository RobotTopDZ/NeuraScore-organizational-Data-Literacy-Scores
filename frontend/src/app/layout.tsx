import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuraScore - Data Literacy Analytics Platform',
  description: 'Measure and visualize organizational data literacy and maturity based on real user behavior logs',
  keywords: ['data analytics', 'data literacy', 'dashboard', 'visualization', 'nlp'],
  authors: [{ name: 'NeuraScore Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
