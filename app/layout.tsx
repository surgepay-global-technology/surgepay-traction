import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SurgePay Analytics Dashboard',
  description: 'Real-time transaction analytics and blockchain wallet monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
