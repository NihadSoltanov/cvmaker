import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/lib/langContext';

export const metadata: Metadata = {
  title: 'Nexora | AI Career Platform',
  description: 'Optimize your CV, ace interviews, and land your dream job using Nexora — the AI-powered career intelligence platform.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
