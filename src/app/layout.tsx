import type { Metadata } from 'next';
import { DM_Sans, Outfit } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Domus — Nekilnojamojo turto valdymas',
  description: 'Savininko ir administratoriaus portalai',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${dmSans.variable} ${outfit.variable}`}>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
