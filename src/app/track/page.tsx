'use client';

import { useState } from 'react';
import { Search, Shirt, CheckCircle, Clock, AlertCircle, Pickaxe, PackageCheck } from 'lucide-react';

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    // We will fetch the order list and find the order by orderNumber.
    // In a real production app we would have a dedicated API like /api/orders/track/[number]
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Gagal mengakses data server.');
      
      const orders = await res.json();
      const match = orders.find((o: any) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase());
      
      if (match) {
        setResult(match);
      } else {
        setError('Nomor resi tidak ditemukan. Pastikan Anda mengetik dengan benar (Misal: ORD-2026...).');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STEPS = [
    { id: 'QUEUE', label: 'Antrean', icon: Clock },
    { id: 'WASHING', label: 'Dicuci', icon: Pickaxe },
    { id: 'IRONING', label: 'Disetrika', icon: AlertCircle },
    { id: 'READY', label: 'Siap Ambil', icon: CheckCircle },
    { id: 'COMPLETED', label: 'Selesai', icon: PackageCheck }
  ];

  const currentStepIndex = result ? STATUS_STEPS.findIndex(s => s.id === result.status) : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Cek Status Cucian</h1>
          <p className="text-muted-foreground">
            Masukkan nomor resi Anda untuk melacak posisi pakaian secara real-time.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Contoh: ORD-2026..." 
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Lacak'}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-border/40 bg-secondary/30">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-semibold text-primary tracking-wider uppercase mb-1">Nota Ditemukan</p>
                  <h3 className="font-bold text-xl">{result.orderNumber}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${result.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                  {result.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">Pelanggan: <span className="font-medium text-foreground">{result.customer.name}</span></p>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold mb-6">Progress Pengerjaan:</h4>
              <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-0.5 bg-border -z-10"></div>
                <div 
                  className="absolute top-5 left-4 h-0.5 bg-primary -z-10 transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                ></div>

                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'} ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold text-center w-16 ${isCurrent ? 'text-primary' : (isCompleted ? 'text-foreground' : 'text-muted-foreground')}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
                <h4 className="text-sm font-semibold mb-2">Rincian Layanan:</h4>
                {result.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity} {item.service.unit} x {item.service.name}</span>
                    <span className="font-medium">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-bold pt-3 mt-3 border-t border-border/40">
                  <span>Total Tagihan</span>
                  <span className="text-primary">Rp {result.finalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
