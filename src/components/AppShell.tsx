'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shirt, LayoutDashboard, ShoppingCart, Users, ReceiptText, Settings, Package, Menu, X, LogOut } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'POS Kasir', href: '/pos' },
  { icon: Shirt, label: 'Order & Cuci', href: '/orders' },
  { icon: Users, label: 'Pelanggan', href: '/customers' },
  { icon: Package, label: 'Master Layanan', href: '/services' },
  { icon: ReceiptText, label: 'Laporan', href: '/reports' },
  { icon: Settings, label: 'Pengaturan', href: '/settings' },
];

interface Session {
  userId: string;
  storeId: string;
  email: string;
  name: string;
  role: string;
  storeName: string;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Pages that should NOT show sidebar
  const publicPages = ['/landing', '/login', '/register', '/track', '/admin'];
  const isPublicPage = publicPages.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isPublicPage) {
      setCheckingAuth(false);
      return;
    }
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setSession(data);
        } else {
          router.push('/landing');
        }
      })
      .catch(() => router.push('/landing'))
      .finally(() => setCheckingAuth(false));
  }, [pathname]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <Shirt className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/landing');
    router.refresh();
  };

  const initials = session.name.substring(0, 2).toUpperCase();

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-blue-300 dark:to-indigo-500 truncate">
          {session.storeName}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/40 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {initials}
          </div>
          <div className="text-sm flex-1 min-w-0">
            <p className="font-semibold truncate">{session.name}</p>
            <p className="text-muted-foreground text-xs truncate">{session.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  const currentNav = navItems.find(n => n.href === pathname);
  const pageTitle = currentNav?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border/40 flex flex-col z-50 animate-in slide-in-from-left duration-300 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-lg">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="px-2 md:px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] md:text-xs font-semibold border border-green-500/20">
              Online
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
