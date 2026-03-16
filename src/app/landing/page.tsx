import Link from 'next/link';
import { Shirt, Zap, BarChart3, MessageSquare, ShieldCheck, Users, ArrowRight, Check } from 'lucide-react';

const features = [
  { icon: Zap, title: 'POS Kasir Instan', desc: 'Catat order dalam hitungan detik dengan kalkulasi harga otomatis.' },
  { icon: Shirt, title: 'Tracking Cucian Live', desc: 'Board Kanban visual dari Antrean hingga Selesai — pelanggan bisa cek mandiri.' },
  { icon: MessageSquare, title: 'Auto-Tagih WA', desc: 'Sistem kirim nota & tagihan via WhatsApp otomatis saat cucian siap diambil.' },
  { icon: BarChart3, title: 'Laporan Keuangan', desc: 'Pantau omset, laba, dan performa cabang dari satu dashboard.' },
  { icon: Users, title: 'CRM Pelanggan', desc: 'Database pelanggan lengkap dengan poin loyalty dan riwayat.' },
  { icon: ShieldCheck, title: 'Multi-Tenant Aman', desc: 'Data setiap toko terisolasi sempurna. Aman dan privat.' },
];

const plans = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '1 bulan',
    desc: 'Coba semua fitur tanpa risiko',
    features: ['1 Cabang', '100 Order / Bulan', 'POS Kasir', 'Tracking Cucian', 'Masa aktif 1 bulan'],
    cta: 'Mulai Gratis',
    highlight: false,
  },
  {
    name: 'Startup',
    price: 'Rp 20rb',
    period: '/bulan',
    desc: 'Untuk laundry yang baru berkembang',
    features: ['1 Cabang', 'Unlimited Order', 'POS Kasir', 'Tracking Cucian', 'Laporan Dasar', 'Support Email'],
    cta: 'Pilih Startup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Rp 50rb',
    period: '/bulan',
    desc: 'Paling populer untuk bisnis laundry',
    features: ['3 Cabang', 'Unlimited Order', 'Semua Fitur POS', 'Auto-Tagih WhatsApp (WAHA)', 'Laporan Lengkap', 'Prioritas Support'],
    cta: 'Pilih Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Rp 100rb',
    period: '/bulan',
    desc: 'Untuk jaringan laundry besar',
    features: ['Unlimited Cabang', 'Unlimited Order', 'Semua Fitur Pro', 'Multi-User & Role', 'Laporan Advanced', 'Dedicated Support'],
    cta: 'Pilih Enterprise',
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Nota Laundry</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Masuk</Link>
            <Link href="/register" className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <Zap className="w-4 h-4" /> Platform #1 untuk Bisnis Laundry
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Kelola Laundry Anda{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Secara Digital</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Dari pencatatan order, tracking cucian, hingga auto-tagih via WhatsApp — semua dalam satu aplikasi modern yang siap pakai.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
              Mulai Gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#pricing" className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary text-foreground font-semibold rounded-xl text-lg hover:bg-secondary/80 transition-all border border-border/50">
              Lihat Harga
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Fitur Terlengkap untuk Laundry Modern</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Semua yang Anda butuhkan untuk mengelola bisnis laundry dari mana saja.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Harga Terjangkau untuk Semua Skala</h2>
            <p className="text-muted-foreground mt-3">Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl border bg-card p-6 flex flex-col relative ${plan.highlight ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20' : 'border-border/50'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    POPULER
                  </div>
                )}
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 border border-border/50'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shirt className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Nota Laundry PRO</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Nota Laundry PRO. Sistem Manajemen Laundry SaaS Terlengkap.</p>
        </div>
      </footer>
    </div>
  );
}
