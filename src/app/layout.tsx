import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RialoTrace | Proof of Work & Engagement Engine',
  description:
    'Track, verify, and showcase your Proof-of-Work contributions to Rialo Network. Independent community terminal — Not affiliated with rialo.io.',
  keywords: ['RialoTrace', 'rialo.io', 'Rialo', 'Subzero Labs', 'Proof of Work', 'Engagement Checker', 'Web3', 'Blockchain'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'RialoTrace | Measure Your Impact on rialo.io',
    description: 'Proof-of-work engagement engine for rialo.io contributors. Not affiliated with rialo.io.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon.png" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
