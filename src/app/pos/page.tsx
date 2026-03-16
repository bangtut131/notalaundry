'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Send, UserPlus } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  isExpress: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface CartItem {
  serviceId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // New Customer Form State
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (service: Service) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item => 
          item.serviceId === service.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
        );
      }
      return [...prev, {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        unit: service.unit,
        quantity: 1,
        subtotal: service.price
      }];
    });
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.serviceId === serviceId) {
        const newQ = Math.max(0.1, item.quantity + delta);
        return { ...item, quantity: Number(newQ.toFixed(2)), subtotal: newQ * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.serviceId !== serviceId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal; // Assuming no discount for now

  const handleSaveCustomer = async () => {
    if (!newCustName || !newCustPhone) return alert('Nama dan No WA wajib diisi');
    
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchCustomers();
      setSelectedCustomerId(data.id);
      setIsAddingCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCheckout = async () => {
    if (!selectedCustomerId) return alert('Pilih pelanggan terlebih dahulu');
    if (cart.length === 0) return alert('Keranjang masih kosong');

    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: cart,
          totalAmount: subtotal,
          discount: 0,
          paymentStatus: 'UNPAID' // Or show a modal to select payment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Order berhasil dibuat! No: ' + data.orderNumber);
      setCart([]);
      setSelectedCustomerId('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Kiri: Daftar Layanan */}
      <div className="flex-1 rounded-xl border border-border/50 bg-card shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/30">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Pilih Layanan
          </h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari layanan (Mis: Kiloan, Karpet, Selimut)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredServices.map((item) => (
            <button 
              key={item.id} 
              onClick={() => addToCart(item)}
              className="text-left p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-primary/10 hover:border-primary/50 transition-all flex flex-col justify-between h-32 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
              <div>
                <span className="text-lg font-bold text-primary">Rp {item.price.toLocaleString('id-ID')}</span>
                <span className="text-xs text-muted-foreground ml-1">/{item.unit}</span>
              </div>
            </button>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground text-sm">
              Layanan tidak ditemukan
            </div>
          )}
        </div>
      </div>

      {/* Kanan: Keranjang/Struk */}
      <div className="w-[400px] rounded-xl border border-border/50 bg-card shadow-sm flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-border/50 bg-secondary/30 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Keranjang Baru</h2>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-destructive hover:underline">Kosongkan</button>
            )}
          </div>
          
          {!isAddingCustomer ? (
            <div className="flex gap-2">
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm appearance-none"
              >
                <option value="">Pilih Pelanggan</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
              <button 
                onClick={() => setIsAddingCustomer(true)}
                className="w-10 flex border border-border/50 rounded-lg shrink-0 items-center justify-center hover:bg-secondary transition-colors"
                title="Tambah Pelanggan Baru"
              >
                <UserPlus className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-3 border border-border rounded-lg bg-background/50">
              <input 
                type="text" placeholder="Nama Pelanggan" 
                value={newCustName} onChange={e => setNewCustName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded bg-background border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input 
                type="tel" placeholder="No WhatsApp (08...)" 
                value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded bg-background border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveCustomer} className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded">Simpan</button>
                <button onClick={() => setIsAddingCustomer(false)} className="flex-1 bg-secondary text-xs font-semibold py-1.5 rounded">Batal</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
               <span>Pilih layanan di samping</span>
               <span>untuk menambahkan ke keranjang</span>
            </div>
          ) : cart.map(item => (
            <div key={item.serviceId} className="flex justify-between items-start pb-4 border-b border-border/30">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <div className="text-muted-foreground text-xs mt-1">Rp {item.price.toLocaleString('id-ID')} / {item.unit}</div>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.serviceId, item.unit === 'KG' ? -0.5 : -1)} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive hover:text-white transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.serviceId, item.unit === 'KG' ? 0.5 : 1)} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-muted-foreground ml-2">{item.unit}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-bold">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                <button onClick={() => removeFromCart(item.serviceId)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Payment */}
        <div className="p-4 bg-secondary/20 border-t border-border/50 space-y-3">
           <div className="flex justify-between items-center text-sm">
             <span className="text-muted-foreground">Subtotal</span>
             <span>Rp {subtotal.toLocaleString('id-ID')}</span>
           </div>
           <div className="flex justify-between items-center text-sm hidden">
             <span className="text-muted-foreground">Diskon (Member)</span>
             <span className="text-emerald-500">- Rp 0</span>
           </div>
           <div className="flex justify-between items-center text-lg font-bold border-t border-border/50 pt-3">
             <span>Total</span>
             <span className="text-primary text-2xl font-black">Rp {total.toLocaleString('id-ID')}</span>
           </div>
           
           <div className="grid grid-cols-2 gap-3 mt-4">
             <button 
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0 || !selectedCustomerId}
                className="col-span-2 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? 'Memproses...' : (
                 <>
                   <Send className="w-4 h-4" />
                   Buat Order & Kirim WA
                 </>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
