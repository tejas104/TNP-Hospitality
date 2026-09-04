import type { Metadata } from 'next';
import AppShell from '@/components/tnp/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'TNP Hospitality | Luxury in Service, Excellence in Care',
  description:
    'A premium interactive prototype for TNP Hospitality: events, planners, freelancers, RSVP and operations in one connected ecosystem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
