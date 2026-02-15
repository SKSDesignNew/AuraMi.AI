import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraMi.AI — Your Family\'s Essence, Preserved Forever',
  description:
    'A conversational AI-powered family history platform. Build your family tree, preserve stories and photos, and ask AI anything about your origin.',
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
