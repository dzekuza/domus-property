import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Domus — Nekilnojamojo turto valdymas',
  description: 'Savininko ir administratoriaus portalai',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${montserrat.variable}`}>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
