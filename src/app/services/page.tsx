'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  isExpress: boolean;
}

const UNIT_OPTIONS = [
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'PCS', label: 'Satuan (PCS)' },
  { value: 'METER', label: 'Meter (M)' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('KG');
  const [formExpress, setFormExpress] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchServices = () => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { setServices(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormName(''); setFormDesc(''); setFormPrice(''); setFormUnit('KG'); setFormExpress(false);
    setShowModal(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    setFormName(svc.name);
    setFormDesc(svc.description || '');
    setFormPrice(String(svc.price));
    setFormUnit(svc.unit);
    setFormExpress(svc.isExpress);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return alert('Nama dan harga wajib diisi');

    setSaving(true);
    try {
      const payload = {
        ...(editingService ? { id: editingService.id } : {}),
        name: formName,
        description: formDesc,
        price: parseFloat(formPrice),
        unit: formUnit,
        isExpress: formExpress,
      };
      const res = await fetch('/api/services', {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (svc: Service) => {
    if (!confirm(`Yakin ingin menghapus layanan "${svc.name}"?`)) return;
    try {
      const res = await fetch(`/api/services?id=${svc.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const inputClass = "w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Layanan</h2>
          <p className="text-muted-foreground mt-1">
            Kelola daftar layanan beserta harga per satuan/kilogram.
          </p>
        </div>
        <button onClick={openAddModal}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2">
          <Plus className="w-4 h-4" />
          Tambah Layanan
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border/40 bg-secondary/30">
              <h3 className="font-semibold text-lg">{editingService ? 'Edit Layanan' : 'Layanan Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Layanan</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Contoh: Cuci Kiloan Reguler" className={inputClass} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Keterangan singkat" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Harga (Rp)</label>
                  <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="7000" className={inputClass} required min="0" step="500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Satuan</label>
                  <select value={formUnit} onChange={e => setFormUnit(e.target.value)} className={inputClass}>
                    {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/30">
                <div>
                  <p className="font-medium text-sm">Layanan Express</p>
                  <p className="text-xs text-muted-foreground">Tandai jika layanan ini premium / kilat</p>
                </div>
                <div onClick={() => setFormExpress(!formExpress)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${formExpress ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 bg-background rounded-full absolute top-0.5 shadow-sm transition-all ${formExpress ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : (editingService ? 'Simpan Perubahan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Layanan</th>
                <th className="px-6 py-4 font-medium">Harga</th>
                <th className="px-6 py-4 font-medium">Satuan</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Memuat layanan...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada layanan. Klik "Tambah Layanan" untuk mulai.</td></tr>
              ) : (
                services.map(svc => (
                  <tr key={svc.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{svc.name}</p>
                          {svc.description && <p className="text-xs text-muted-foreground">{svc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">Rp {svc.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-medium bg-secondary">{svc.unit}</span></td>
                    <td className="px-6 py-4">
                      {svc.isExpress ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">EXPRESS</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">REGULER</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(svc)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(svc)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
