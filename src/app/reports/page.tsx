import { BarChart3, TrendingUp, CalendarDays, Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan omset dan performa bisnis bulan ini.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center rounded-md bg-secondary border border-border/50 px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col items-center text-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Total Pendapatan (Bulan Ini)</h3>
          <p className="text-3xl font-bold">Rp 8.450.000</p>
          <p className="text-xs text-emerald-500 font-medium">+12.5% dari bulan lalu</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col items-center text-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Total Transaksi</h3>
          <p className="text-3xl font-bold">248</p>
          <p className="text-xs text-muted-foreground">Order diselesaikan</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col items-center text-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Rata-rata Harian</h3>
          <p className="text-3xl font-bold">Rp 384.090</p>
          <p className="text-xs text-muted-foreground">Per hari kerja</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/40">
          <h3 className="font-semibold text-lg">Riwayat Arus Kas (Terbaru)</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Grafik dan tabel detail segera hadir pada iterasi berikutnya.</p>
        </div>
      </div>
    </div>
  );
}
