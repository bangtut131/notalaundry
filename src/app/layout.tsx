import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import AppShell from '@/components/AppShell';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nota Laundry PRO',
  description: 'Sistem Manajemen Laundry SaaS Terlengkap dan Powerful',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
