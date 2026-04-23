export const formatRupiah = (amount) => {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatShort = (amount) => {
  const n = Math.abs(Number(amount || 0));
  const sign = Number(amount || 0) < 0 ? "-" : "";
  if (n >= 1_000_000_000) return `${sign}Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${sign}Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000) return `${sign}Rp ${(n / 1_000).toFixed(0)}rb`;
  return `${sign}Rp ${n}`;
};

export const stripDigits = (s) => String(s).replace(/\D/g, "");

export const todayISO = () => new Date().toISOString().split("T")[0];

export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const formatDateID = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTimeID = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

export const INCOME_CATEGORIES = ["Penjualan", "Jasa", "Investasi", "Lainnya"];
export const OUTCOME_CATEGORIES = [
  "Operasional",
  "Marketing",
  "Gaji",
  "Sewa",
  "Utilitas",
  "Bahan Baku",
  "Lainnya",
];
