import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyVansh.AI — Every Family Has a Story Worth Keeping',
  description:
    'A conversational AI-powered family history platform. Chat naturally to discover, record, and explore your family history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
