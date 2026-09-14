import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RialoTrace | Proof of Work & Engagement Engine for rialo.io',
  description:
    'Track, verify, and showcase your Proof-of-Work contributions to rialo.io (The high-throughput network with configurable privacy for real-world finance).',
  keywords: ['RialoTrace', 'rialo.io', 'Rialo', 'Subzero Labs', 'Proof of Work', 'Engagement Checker', 'Web3', 'Blockchain'],
  openGraph: {
    title: 'RialoTrace | Measure Your Impact on rialo.io',
    description: 'Proof-of-work engagement engine for rialo.io contributors.',
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
        <link rel="icon" href="https://rialo.io/images/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
