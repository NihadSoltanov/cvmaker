import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CV Optimizer | Propel Your Career',
  description: 'Optimize your CV and cover letter for any job using AI.',
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
