import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RialoTrace | Proof of Work & Engagement Engine for Rialo Network',
  description:
    'Track, verify, and showcase your Proof-of-Work contributions to Rialo Network (The high-throughput network with configurable privacy for real-world finance).',
  keywords: ['RialoTrace', 'Rialo Network', 'Rialo', 'Subzero Labs', 'Proof of Work', 'Engagement Checker', 'Web3', 'Blockchain'],
  openGraph: {
    title: 'RialoTrace | Measure Your Impact on Rialo Network',
    description: 'Proof-of-work engagement engine for Rialo Network contributors.',
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
