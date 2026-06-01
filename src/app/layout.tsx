import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
});

const tomatoGrotesk = localFont({
  src: [
    { path: './fonts/TomatoGrotesk-Regular.otf',   weight: '400', style: 'normal' },
    { path: './fonts/TomatoGrotesk-Medium.otf',    weight: '500', style: 'normal' },
    { path: './fonts/TomatoGrotesk-SemiBold.otf',  weight: '600', style: 'normal' },
    { path: './fonts/TomatoGrotesk-Bold.otf',      weight: '700', style: 'normal' },
    { path: './fonts/TomatoGrotesk-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Miteda — Nekilnojamojo turto valdymas',
  description: 'Savininko ir administratoriaus portalai',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${tomatoGrotesk.variable}`}>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
