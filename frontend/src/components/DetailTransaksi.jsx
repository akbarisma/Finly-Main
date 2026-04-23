import { useEffect, useState } from "react";
import { MagnifyingGlass, DownloadSimple, Trash, CaretLeft, CaretRight } from "@phosphor-icons/react";
import api from "../services/api";
import {
  formatRupiah, formatDateID, currentMonth,
  INCOME_CATEGORIES, OUTCOME_CATEGORIES,
} from "../services/utils";

export default function DetailTransaksi() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], total: 0, totals: { income: 0, outcome: 0 }, net: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPage(1); }, [month, type, category, search]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const params = { month, type, category, page, limit: 20 };
    if (search) params.search = search;
    api.getTransactions(params)
      .then((d) => { if (!cancel) setData(d); })
      .catch(() => { if (!cancel) setData({ data: [], total: 0, totals: { income: 0, outcome: 0 }, net: 0 }); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [month, type, category, search, page]);

  const cats = type === "income" ? INCOME_CATEGORIES : type === "outcome" ? OUTCOME_CATEGORIES : [...INCOME_CATEGORIES, ...OUTCOME_CATEGORIES];

  const onDelete = async (id) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    try {
      await api.deleteTransaction(id);
      setData((d) => ({ ...d, data: d.data.filter((t) => t.id !== id), total: d.total - 1 }));
    } catch { /* noop */ }
  };

  const exportCSV = () => {
    const rows = [["Tanggal", "Jenis", "Kategori", "Nominal", "Deskripsi"]];
    data.data.forEach((t) => rows.push([t.date, t.type, t.category, t.amount, (t.description || "").replace(/"/g, '""')]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finly-transaksi-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / 20));

  return (
    <div className="px-8 py-8 space-y-6" data-testid="detail-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b hairline-strong pb-6">
        <div>
          <div className="overline">MODUL 04 · AUDIT TRAIL</div>
          <h1 className="font-display font-black text-5xl tracking-tighter mt-2">Detail Transaksi</h1>
        </div>
        <button onClick={exportCSV} className="btn-ghost flex items-center gap-2 self-start md:self-auto" data-testid="detail-export-csv">
          <DownloadSimple size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="brut-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label-brut">Bulan</label>
          <input type="month" className="input-brut input-mono" value={month} onChange={(e) => setMonth(e.target.value)} data-testid="detail-month" />
        </div>
        <div>
          <label className="label-brut">Jenis</label>
          <select className="input-brut" value={type} onChange={(e) => { setType(e.target.value); setCategory("all"); }} data-testid="detail-type">
            <option value="all">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="outcome">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label className="label-brut">Kategori</label>
          <select className="input-brut" value={category} onChange={(e) => setCategory(e.target.value)} data-testid="detail-category">
            <option value="all">Semua</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-brut">Cari deskripsi</label>
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input className="input-brut pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="kata kunci…" data-testid="detail-search" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="brut-card p-5">
          <div className="overline">TOTAL ENTRI</div>
          <div className="kpi-value text-3xl mt-2" data-testid="detail-total-count">{data.total}</div>
        </div>
        <div className="brut-card p-5">
          <div className="overline">Σ PEMASUKAN</div>
          <div className="kpi-value text-3xl mt-2 text-pos" data-testid="detail-total-income">{formatRupiah(data.totals?.income)}</div>
        </div>
        <div className="brut-card p-5">
          <div className="overline">Σ PENGELUARAN</div>
          <div className="kpi-value text-3xl mt-2 text-neg" data-testid="detail-total-outcome">{formatRupiah(data.totals?.outcome)}</div>
        </div>
        <div className="brut-card p-5">
          <div className="overline">NET</div>
          <div className={`kpi-value text-3xl mt-2 ${data.net >= 0 ? "text-pos" : "text-neg"}`} data-testid="detail-net">{formatRupiah(data.net)}</div>
        </div>
      </div>

      <div className="brut-card">
        <div className="overflow-x-auto scroll-custom">
          <table className="brut-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Tanggal</th>
                <th style={{ width: 90 }}>Jenis</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th className="text-right">Nominal</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="text-center font-mono py-8 text-[var(--ink-soft)]">Memuat…</td></tr>}
              {!loading && data.data.length === 0 && (
                <tr><td colSpan="6" className="text-center font-mono py-10 text-[var(--ink-soft)]">Tidak ada data.</td></tr>
              )}
              {!loading && data.data.map((t) => (
                <tr key={t.id} data-testid={`detail-row-${t.id}`}>
                  <td className="font-mono text-sm">{formatDateID(t.date)}</td>
                  <td><span className={t.type === "income" ? "tag tag-income" : "tag tag-outcome"}>{t.type === "income" ? "IN" : "OUT"}</span></td>
                  <td className="text-sm">{t.category}</td>
                  <td className="text-sm text-[var(--ink-soft)] max-w-[360px] truncate">{t.description || "—"}</td>
                  <td className={`font-mono text-right font-semibold ${t.type === "income" ? "text-pos" : "text-neg"}`}>
                    {t.type === "income" ? "+" : "−"}{formatRupiah(t.amount)}
                  </td>
                  <td className="text-right">
                    <button onClick={() => onDelete(t.id)} className="p-1 hover:bg-neg-soft" data-testid={`detail-delete-${t.id}`}>
                      <Trash size={14} className="text-neg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t hairline">
          <div className="font-mono text-xs text-[var(--ink-soft)]">Hal. {page} dari {totalPages}</div>
          <div className="flex gap-2">
            <button className="btn-ghost p-2" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} data-testid="detail-prev">
              <CaretLeft size={14} />
            </button>
            <button className="btn-ghost p-2" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} data-testid="detail-next">
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
