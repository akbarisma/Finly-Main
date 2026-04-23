import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendUp, Receipt } from "@phosphor-icons/react";
import api from "../services/api";
import { formatRupiah, formatShort, currentMonth, monthLabel } from "../services/utils";

const colors = { income: "#059669", outcome: "#E11D48", ink: "#0A0A0A" };

function KPI({ label, value, sub, accent, testid, icon: Icon }) {
  return (
    <div className="brut-card p-6 flex flex-col justify-between min-h-[150px]" data-testid={testid}>
      <div className="flex items-start justify-between">
        <div className="overline">{label}</div>
        {Icon && <Icon size={18} weight="regular" className="text-[var(--ink-soft)]" />}
      </div>
      <div>
        <div className={`kpi-value text-4xl ${accent || ""}`}>{value}</div>
        {sub && <div className="text-xs text-[var(--ink-soft)] mt-2 font-mono">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.getDashboard(month)
      .then((d) => { if (!cancel) setData(d); })
      .catch(() => { if (!cancel) setData(null); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [month]);

  const chartData = useMemo(() => data?.daily_chart || [], [data]);
  const catData = useMemo(() => (data?.category_chart || []).slice(0, 6), [data]);

  const pl = data?.profit_loss || 0;
  const plPositive = pl >= 0;

  return (
    <div className="px-8 py-8 space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b hairline-strong pb-6">
        <div>
          <div className="overline">BERANDA · RINGKASAN BULANAN</div>
          <h1 className="font-display font-black text-5xl tracking-tighter mt-2">
            {monthLabel(month)}
          </h1>
          <div className="ticker mt-2">PERIODE · {month}-01 → {month}-31</div>
        </div>
        <div className="flex items-center gap-3">
          <label className="overline">BULAN</label>
          <input
            type="month"
            className="input-brut input-mono max-w-[200px]"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            data-testid="dashboard-month-picker"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total Pendapatan"
          value={loading ? "…" : formatShort(data?.revenue)}
          sub={data ? formatRupiah(data.revenue) : ""}
          accent="text-pos"
          icon={ArrowUpRight}
          testid="kpi-revenue"
        />
        <KPI
          label="Total Pengeluaran"
          value={loading ? "…" : formatShort((data?.outcome || 0) + (data?.budget_total || 0) + (data?.monthly_capital || 0))}
          sub={data ? `${formatRupiah(data.outcome)} · Anggaran ${formatRupiah(data.budget_total)}${data.monthly_capital ? ` · Modal ${formatRupiah(data.monthly_capital)}` : ""}` : ""}
          accent="text-neg"
          icon={ArrowDownRight}
          testid="kpi-outcome"
        />
        <KPI
          label="Laba / Rugi"
          value={loading ? "…" : formatShort(pl)}
          sub={plPositive ? "SURPLUS" : "DEFISIT"}
          accent={plPositive ? "text-pos" : "text-neg"}
          icon={TrendUp}
          testid="kpi-profit-loss"
        />
        <KPI
          label="Jumlah Transaksi"
          value={loading ? "…" : String(data?.transaction_count ?? 0)}
          sub="entri bulan ini"
          icon={Receipt}
          testid="kpi-tx-count"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="brut-card p-6 lg:col-span-2" data-testid="dashboard-area-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="overline">ARUS HARIAN</div>
              <div className="font-display font-bold text-xl tracking-tight mt-1">Pendapatan vs Pengeluaran</div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[var(--ink-soft)]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: colors.income }} /> Pendapatan</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: colors.outcome }} /> Pengeluaran</span>
            </div>
          </div>
          <div className="h-[320px]">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[var(--ink-soft)] font-mono">
                Belum ada transaksi di periode ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-in" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.income} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={colors.income} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-out" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.outcome} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={colors.outcome} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(10,10,10,0.06)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontFamily: "JetBrains Mono", fontSize: 11 }} tickFormatter={(d) => d.slice(8)} stroke="#525252" />
                  <YAxis tick={{ fontFamily: "JetBrains Mono", fontSize: 11 }} tickFormatter={(v) => formatShort(v)} stroke="#525252" width={60} />
                  <Tooltip
                    contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 12, border: "1px solid #0A0A0A", borderRadius: 0 }}
                    formatter={(v, name) => [formatRupiah(v), name === "income" ? "Pendapatan" : "Pengeluaran"]}
                  />
                  <Area type="monotone" dataKey="income" stroke={colors.income} strokeWidth={2} fill="url(#g-in)" />
                  <Area type="monotone" dataKey="outcome" stroke={colors.outcome} strokeWidth={2} fill="url(#g-out)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="brut-card p-6" data-testid="dashboard-category-chart">
          <div className="overline">KATEGORI PENGELUARAN</div>
          <div className="font-display font-bold text-xl tracking-tight mt-1">Top Pos Biaya</div>
          <div className="h-[320px] mt-4">
            {catData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[var(--ink-soft)] font-mono">Belum ada data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(10,10,10,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }} tickFormatter={(v) => formatShort(v)} stroke="#525252" />
                  <YAxis type="category" dataKey="category" tick={{ fontFamily: "IBM Plex Sans", fontSize: 11 }} stroke="#525252" width={90} />
                  <Tooltip
                    contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 12, border: "1px solid #0A0A0A", borderRadius: 0 }}
                    formatter={(v) => [formatRupiah(v), "Pengeluaran"]}
                  />
                  <Bar dataKey="amount" fill={colors.ink} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
