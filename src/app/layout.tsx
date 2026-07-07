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
    { path: './fonts/TomatoGrotesk-Thin.otf',              weight: '100', style: 'normal' },
    { path: './fonts/TomatoGrotesk-ThinSlanted.otf',       weight: '100', style: 'italic' },
    { path: './fonts/TomatoGrotesk-ExtraLight.otf',        weight: '200', style: 'normal' },
    { path: './fonts/TomatoGrotesk-ExtraLightSlanted.otf', weight: '200', style: 'italic' },
    { path: './fonts/TomatoGrotesk-Light.otf',             weight: '300', style: 'normal' },
    { path: './fonts/TomatoGrotesk-LightSlanted.otf',      weight: '300', style: 'italic' },
    { path: './fonts/TomatoGrotesk-Regular.otf',           weight: '400', style: 'normal' },
    { path: './fonts/TomatoGrotesk-Slanted.otf',           weight: '400', style: 'italic' },
    { path: './fonts/TomatoGrotesk-Medium.otf',            weight: '500', style: 'normal' },
    { path: './fonts/TomatoGrotesk-MediumSlanted.otf',     weight: '500', style: 'italic' },
    { path: './fonts/TomatoGrotesk-SemiBold.otf',          weight: '600', style: 'normal' },
    { path: './fonts/TomatoGrotesk-SemiBoldSlanted.otf',   weight: '600', style: 'italic' },
    { path: './fonts/TomatoGrotesk-Bold.otf',              weight: '700', style: 'normal' },
    { path: './fonts/TomatoGrotesk-BoldSlanted.otf',       weight: '700', style: 'italic' },
    { path: './fonts/TomatoGrotesk-ExtraBold.otf',         weight: '800', style: 'normal' },
    { path: './fonts/TomatoGrotesk-ExtraBoldSlanted.otf',  weight: '800', style: 'italic' },
    { path: './fonts/TomatoGrotesk-Black.otf',             weight: '900', style: 'normal' },
    { path: './fonts/TomatoGrotesk-BlackSlanted.otf',      weight: '900', style: 'italic' },
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
      <body style={{ minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
