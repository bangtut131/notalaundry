'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Smartphone, Check, Eye, EyeOff } from 'lucide-react';

type TabKey = 'umum' | 'waha' | 'keamanan';

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: 'umum', label: 'Umum', icon: Settings },
  { key: 'waha', label: 'Integrasi WAHA', icon: Smartphone },
  { key: 'keamanan', label: 'Keamanan', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');

  // --- Umum ---
  const [storeName, setStoreName] = useState('...');
  const [storeAddress, setStoreAddress] = useState('...');
  const [enableWaha, setEnableWaha] = useState(false);

  // --- WAHA ---
  const [wahaApiUrl, setWahaApiUrl] = useState('');
  const [wahaApiKey, setWahaApiKey] = useState('');
  const [wahaSession, setWahaSession] = useState('default');
  const [wahaTestPhone, setWahaTestPhone] = useState('');
  const [wahaTesting, setWahaTesting] = useState(false);
  const [wahaTestResult, setWahaTestResult] = useState<string | null>(null);

  // --- Keamanan ---
  const [adminEmail, setAdminEmail] = useState('admin@laundry.id');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setStoreName(data.storeName || 'Nota Laundry PRO');
        setStoreAddress(data.storeAddress || '');
        setEnableWaha(data.enableWaha !== undefined ? data.enableWaha : true);
        setWahaApiUrl(data.wahaApiUrl || '');
        setWahaApiKey(data.wahaApiKey || '');
        setWahaSession(data.wahaSession || 'default');
        setAdminEmail(data.adminEmail || 'admin@laundry.id');
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, storeAddress, enableWaha, wahaApiUrl, wahaApiKey, wahaSession, adminEmail })
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword) return alert('Masukkan password lama terlebih dahulu.');
    if (newPassword.length < 6) return alert('Password baru minimal 6 karakter.');
    if (newPassword !== confirmPassword) return alert('Konfirmasi password tidak cocok.');
    // For now, store in settings file. In production, use proper auth.
    alert('Password admin berhasil diubah! (Simulasi)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleTestWaha = async () => {
    if (!wahaApiUrl) return alert('Masukkan WAHA API URL terlebih dahulu.');
    if (!wahaTestPhone) return alert('Masukkan nomor WA tujuan uji coba.');
    
    setWahaTesting(true);
    setWahaTestResult(null);
    try {
      const res = await fetch(`${wahaApiUrl}/api/sendText`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {})
        },
        body: JSON.stringify({
          chatId: `${wahaTestPhone.replace(/^0/, '62')}@c.us`,
          text: '✅ Test koneksi WAHA dari Nota Laundry PRO berhasil!',
          session: wahaSession || 'default'
        })
      });
      if (res.ok) {
        setWahaTestResult('success');
      } else {
        const errData = await res.json().catch(() => ({}));
        setWahaTestResult(`error: ${errData.message || res.statusText}`);
      }
    } catch (err: any) {
      setWahaTestResult(`error: ${err.message}`);
    } finally {
      setWahaTesting(false);
    }
  };

  const inputClass = "w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground mt-1">
          Kelola referensi toko, notifikasi WhatsApp, dan profil admin.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Settings Sidebar */}
        <div className="md:col-span-3 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 font-medium rounded-lg text-sm transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-9 rounded-xl border border-border/50 bg-card shadow-sm">

          {/* ===== TAB: UMUM ===== */}
          {activeTab === 'umum' && (
            <>
              <div className="p-6 border-b border-border/40">
                <h3 className="font-semibold text-lg">Informasi Toko</h3>
                <p className="text-sm text-muted-foreground mt-1">Logo, nama toko, dan alamat cabang.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Laundry</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} disabled={loading} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat Cabang Induk</label>
                  <textarea value={storeAddress} onChange={e => setStoreAddress(e.target.value)} disabled={loading}
                    className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Tagih WhatsApp</label>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-secondary/30">
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm">Aktifkan pengiriman nota via WAHA</p>
                      <p className="text-xs text-muted-foreground">Kirim teks resi jika status order menjadi Selesai</p>
                    </div>
                    <div onClick={() => !loading && setEnableWaha(!enableWaha)}
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${enableWaha ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`w-5 h-5 bg-background rounded-full absolute top-0.5 shadow-sm transition-all ${enableWaha ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40 flex justify-end items-center gap-3">
                  {saved && <span className="text-sm text-emerald-500 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={loading || saving}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ===== TAB: INTEGRASI WAHA ===== */}
          {activeTab === 'waha' && (
            <>
              <div className="p-6 border-b border-border/40">
                <h3 className="font-semibold text-lg">Integrasi WhatsApp (WAHA)</h3>
                <p className="text-sm text-muted-foreground mt-1">Konfigurasi koneksi ke WAHA API untuk pengiriman pesan otomatis.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                  <p className="text-sm text-blue-400">
                    <strong>Petunjuk:</strong> Pastikan Anda sudah menjalankan server WAHA (WhatsApp HTTP API) dan sudah menscan QR Code dari dashboard WAHA untuk menghubungkan nomor Anda.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">WAHA API URL</label>
                  <input type="url" value={wahaApiUrl} onChange={e => setWahaApiUrl(e.target.value)} disabled={loading} placeholder="http://localhost:3008" className={inputClass} />
                  <p className="text-xs text-muted-foreground">Alamat server WAHA Anda (contoh: http://localhost:3008)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key (Opsional)</label>
                  <input type="text" value={wahaApiKey} onChange={e => setWahaApiKey(e.target.value)} disabled={loading} placeholder="Kosongkan jika tidak ada" className={inputClass} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Session</label>
                  <input type="text" value={wahaSession} onChange={e => setWahaSession(e.target.value)} disabled={loading} placeholder="default" className={inputClass} />
                  <p className="text-xs text-muted-foreground">Biasanya &quot;default&quot; kecuali Anda membuat session custom.</p>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-4">
                  <h4 className="text-sm font-semibold">Uji Coba Kirim Pesan</h4>
                  <div className="flex gap-3">
                    <input type="tel" value={wahaTestPhone} onChange={e => setWahaTestPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={inputClass} />
                    <button onClick={handleTestWaha} disabled={wahaTesting}
                      className="shrink-0 inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                      {wahaTesting ? 'Mengirim...' : 'Kirim Test'}
                    </button>
                  </div>
                  {wahaTestResult && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${wahaTestResult === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                      {wahaTestResult === 'success' ? '✅ Pesan test berhasil terkirim!' : `❌ Gagal: ${wahaTestResult.replace('error: ', '')}`}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40 flex justify-end items-center gap-3">
                  {saved && <span className="text-sm text-emerald-500 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={loading || saving}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Menyimpan...' : 'Simpan Konfigurasi WAHA'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ===== TAB: KEAMANAN ===== */}
          {activeTab === 'keamanan' && (
            <>
              <div className="p-6 border-b border-border/40">
                <h3 className="font-semibold text-lg">Keamanan Akun</h3>
                <p className="text-sm text-muted-foreground mt-1">Kelola email admin dan password akses sistem.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Admin</label>
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} disabled={loading} className={inputClass} />
                </div>

                <div className="pt-4 border-t border-border/40 space-y-4">
                  <h4 className="text-sm font-semibold">Ubah Password</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password Lama</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password Baru</label>
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className={inputClass} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru" className={inputClass} />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive font-medium">Password tidak cocok</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
                  <button onClick={handleSave} disabled={loading || saving}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-secondary border border-border/50 px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
                    {saving ? 'Menyimpan...' : 'Simpan Email'}
                  </button>
                  <button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Ubah Password
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
