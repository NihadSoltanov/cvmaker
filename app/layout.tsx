import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CViq | AI Career Platform',
  description: 'Optimize your CV, ace interviews, and land your dream job using CViq — the AI-powered career intelligence platform.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
