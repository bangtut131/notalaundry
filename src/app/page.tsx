'use client';

import { DollarSign, Pickaxe, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center animate-pulse">Menghitung Data...</div>;
  if (data.error) return <div className="p-8 text-center text-destructive font-medium border border-destructive/20 bg-destructive/10 rounded-lg m-6">Gagal memuat: {data.error}</div>;
  if (!data.metrics) return <div className="p-8 text-center animate-pulse">Memuat Metrik...</div>;

  const m = data.metrics;
  const revenue = m.revenue ?? 0;
  const orders = m.orders ?? 0;
  const activeOrders = m.activeOrders ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Selamat Datang 👋</h2>
        <p className="text-muted-foreground mt-1">
          Pantau performa bisnis laundry Anda bulan ini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pendapatan Bulan Ini</h3>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">Rp {revenue.toLocaleString('id-ID')}</div>
          <p className="text-xs text-muted-foreground mt-1">Total dari order lunas</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Order</h3>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{orders}</div>
          <p className="text-xs text-muted-foreground mt-1">Order masuk bulan ini</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Sedang Diproses</h3>
            <Pickaxe className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{activeOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">Antrean, Cuci, Setrika</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Order Terbaru</h3>
            <Link href="/orders" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-4">
            {!data.recentOrders || data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground pt-3">Belum ada order. Mulai dari POS Kasir!</p>
            ) : data.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/40">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {order.customer?.name?.substring(0, 2)?.toUpperCase() || '??'}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{order.customer?.name || 'Unknown'}</h4>
                    <p className="text-xs text-muted-foreground">{order.orderNumber} • {order.items?.length || 0} Layanan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">Rp {(order.finalAmount || 0).toLocaleString('id-ID')}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.status === 'QUEUE' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Aksi Cepat</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/pos" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-border/50 bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all group">
              <ShoppingCart className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Kasir Baru</span>
            </Link>
            <Link href="/orders" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-border/50 bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all group">
              <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Update Status</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
