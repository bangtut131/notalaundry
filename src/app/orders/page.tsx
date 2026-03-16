'use client';

import { useState, useEffect } from 'react';
import { Clock, Pickaxe, CheckCircle, PackageCheck, AlertCircle } from 'lucide-react';

type OrderStatus = 'QUEUE' | 'WASHING' | 'IRONING' | 'READY' | 'COMPLETED';

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  finalAmount: number;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    quantity: number;
    service: { name: string, unit: string }
  }>;
  createdAt: string;
}

const STATUS_COLUMNS: { id: OrderStatus, label: string, icon: any, color: string }[] = [
  { id: 'QUEUE', label: 'Antrean Baru', icon: Clock, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { id: 'WASHING', label: 'Proses Cuci', icon: Pickaxe, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'IRONING', label: 'Proses Setrika', icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'READY', label: 'Siap Diambil', icon: CheckCircle, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { id: 'COMPLETED', label: 'Selesai (Lunas)', icon: PackageCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
];

export default function OrdersKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Optionally re-fetch to ensure sync: fetchOrders();
    } catch (e) {
      alert("Gagal mengupdate status");
      fetchOrders(); // Revert on fail
    }
  };

  const markAsPaid = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'PAID' } : o));
    await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID' })
    });
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Memuat data order...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Status Pengerjaan (Live Board)</h2>
        <p className="text-muted-foreground mt-1">
          Geser status ke kanan atau klik tombol aksi untuk mengirim tagihan ke pelanggan otomatis.
        </p>
      </div>

      {/* HORIZONTAL SCROLL KANBAN */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
        {STATUS_COLUMNS.map(column => {
          const colOrders = orders.filter(o => o.status === column.id);
          const Icon = column.icon;

          return (
            <div key={column.id} className="flex-shrink-0 w-[320px] rounded-xl border border-border/50 bg-secondary/20 flex flex-col snap-start">
              {/* Header */}
              <div className={`p-3 border-b border-border/50 flex justify-between items-center rounded-t-xl ${column.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-background/50 rounded-full">{colOrders.length}</span>
              </div>

              {/* Body */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {colOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic opacity-50">
                    Kosong
                  </div>
                ) : colOrders.map(order => (
                  <div key={order.id} className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:border-primary/40 transition-colors animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{order.orderNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {order.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                      {order.customer.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 mt-1">
                      {order.items.length} Layanan (Total: Rp {order.finalAmount.toLocaleString('id-ID')})
                    </p>
                    
                    <div className="pt-3 border-t border-border/40 flex flex-wrap gap-2 text-xs">
                       {column.id === 'QUEUE' && (
                         <button onClick={() => updateOrderStatus(order.id, 'WASHING')} className="px-3 py-1.5 bg-blue-500/10 text-blue-500 font-medium rounded hover:bg-blue-500/20 w-full text-center">
                           Mulai Cuci
                         </button>
                       )}
                       {column.id === 'WASHING' && (
                         <button onClick={() => updateOrderStatus(order.id, 'IRONING')} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 font-medium rounded hover:bg-yellow-500/20 w-full text-center">
                           Pindah ke Setrika
                         </button>
                       )}
                       {column.id === 'IRONING' && (
                         <button onClick={() => updateOrderStatus(order.id, 'READY')} className="px-3 py-1.5 bg-purple-500 text-white font-medium rounded hover:brightness-110 w-full text-center animate-pulse">
                           Selesai & Tagih (WA)
                         </button>
                       )}
                       {column.id === 'READY' && (
                         <>
                           {order.paymentStatus !== 'PAID' && (
                             <button onClick={() => markAsPaid(order.id)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 font-medium rounded hover:bg-emerald-500/20 flex-1 text-center">
                               Bayar Lunas
                             </button>
                           )}
                           <button onClick={() => {
                              if(order.paymentStatus !== 'PAID') return alert('Lunasi dulu sebelum diambil!');
                              updateOrderStatus(order.id, 'COMPLETED');
                           }} className="px-3 py-1.5 bg-secondary text-foreground font-medium rounded hover:bg-secondary/80 flex-1 text-center">
                             Diambil
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
