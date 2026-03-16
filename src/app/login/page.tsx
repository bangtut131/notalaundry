'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shirt, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Check if superadmin → redirect to admin panel
      const meRes = await fetch('/api/auth/me');
      const me = await meRes.json();
      if (me.role === 'SUPERADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Masuk</h1>
          <p className="text-muted-foreground mt-2">Masuk ke dashboard laundry Anda</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full h-10 rounded-md border border-input bg-transparent pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="admin@laundry.id" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full h-10 rounded-md border border-input bg-transparent pl-10 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">Daftar Gratis</Link>
        </p>
        <p className="text-center">
          <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground">← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
