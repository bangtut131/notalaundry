'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return alert('Nama dan No WA wajib diisi');
    
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      
      setNewName('');
      setNewPhone('');
      setIsAdding(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pelanggan</h2>
          <p className="text-muted-foreground mt-1">
            Kelola data pelanggan dan riwayat poin loyalty mereka.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border/40 bg-secondary/30">
              <h3 className="font-semibold text-lg">Pelanggan Baru</h3>
              <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Pelanggan</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">No. WhatsApp</label>
                <input 
                  type="tel" 
                  value={newPhone} 
                  onChange={e => setNewPhone(e.target.value)} 
                  className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" 
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/40 flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari nama atau nomor WA..." 
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-8"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Pelanggan</th>
                <th className="px-6 py-4 font-medium">No. WhatsApp</th>
                <th className="px-6 py-4 font-medium">Poin</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Belum ada data pelanggan.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-xs uppercase">
                        {customer.name.substring(0, 2)}
                      </div>
                      {customer.name}
                    </td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500">
                        {customer.point} Poin
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-xs font-medium">Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
