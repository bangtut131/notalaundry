import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Shirt, LayoutDashboard, ShoppingCart, Users, ReceiptText, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nota Laundry PRO',
  description: 'Sistem Manajemen Laundry Terlengkap dan Powerful',
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'POS Kasir', href: '/pos' },
  { icon: Shirt, label: 'Order & Cuci', href: '/orders' },
  { icon: Users, label: 'Pelanggan', href: '/customers' },
  { icon: ReceiptText, label: 'Laporan', href: '/reports' },
  { icon: Settings, label: 'Pengaturan', href: '/settings' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-screen bg-background flex`}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border/40">
            <span className="font-bold text-xl tracking-tight gradient-text">Nota Laundry</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center gap-3 px-3 py-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                AD
              </div>
              <div className="text-sm">
                <p className="font-semibold">Admin Pusat</p>
                <p className="text-muted-foreground text-xs">admin@laundry.id</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar/Header */}
          <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
            <h1 className="font-semibold text-lg">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold border border-green-500/20">
                WAHA: Connected
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold border border-blue-500/20">
                DB: Supabase
              </span>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
