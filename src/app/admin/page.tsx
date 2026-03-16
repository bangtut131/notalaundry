'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Store, Users, ShoppingCart, ArrowUpCircle, Power, PowerOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StoreData {
  id: string;
  name: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  planStart: string;
  owner: { name: string; email: string } | null;
  _count: { users: number; orders: number; customers: number };
}

const PLANS = ['STARTER', 'STARTUP', 'PRO', 'ENTERPRISE'];
const PLAN_COLORS: Record<string, string> = {
  STARTER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  STARTUP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PRO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ENTERPRISE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated || data.role !== 'SUPERADMIN') {
          router.push('/landing');
          return;
        }
        setSession(data);
        fetchStores();
      })
      .catch(() => router.push('/landing'));
  }, []);

  const fetchStores = () => {
    fetch('/api/admin/stores')
      .then(r => r.json())
      .then(data => { setStores(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const updateStore = async (storeId: string, updates: { plan?: string; isActive?: boolean }) => {
    setActionLoading(storeId);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, ...updates })
      });
      if (!res.ok) throw new Error('Failed');
      fetchStores();
    } catch (e) {
      alert('Gagal mengupdate toko');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/landing');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat Panel Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-xl">Super Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session?.email}</span>
            <button onClick={handleLogout} className="text-sm text-destructive hover:underline">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-sm text-muted-foreground">Total Toko</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-2xl font-bold">{stores.filter(s => s.isActive).length}</div>
            <p className="text-sm text-muted-foreground">Toko Aktif</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-2xl font-bold">{stores.reduce((a, s) => a + s._count.orders, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Order</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-2xl font-bold">{stores.reduce((a, s) => a + s._count.customers, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Pelanggan</p>
          </div>
        </div>

        {/* Stores Table */}
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="font-semibold text-lg">Daftar Toko Terdaftar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Toko</th>
                  <th className="px-4 py-3 font-medium">Pemilik</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Terdaftar</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Memuat data...</td></tr>
                ) : stores.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Belum ada toko terdaftar.</td></tr>
                ) : stores.map(store => (
                  <tr key={store.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{store.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {store.owner ? (
                        <div>
                          <p className="font-medium text-xs">{store.owner.name}</p>
                          <p className="text-xs text-muted-foreground">{store.owner.email}</p>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={store.plan}
                        onChange={e => updateStore(store.id, { plan: e.target.value })}
                        disabled={actionLoading === store.id}
                        className={`px-2 py-1 rounded-md text-xs font-bold border cursor-pointer ${PLAN_COLORS[store.plan] || ''} bg-transparent`}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${store.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {store.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{store._count.orders}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(store.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => updateStore(store.id, { isActive: !store.isActive })}
                        disabled={actionLoading === store.id}
                        className={`p-1.5 rounded-md transition-colors ${store.isActive ? 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive' : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-500'}`}
                        title={store.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {store.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
