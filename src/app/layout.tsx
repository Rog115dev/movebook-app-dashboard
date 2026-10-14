import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Movesbook App Settings',
  description: 'Admin dashboard to manage FitAI Coach mobile app content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
