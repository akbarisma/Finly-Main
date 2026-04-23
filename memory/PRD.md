# Finly — Product Requirements Document

## Problem Statement
User provided `prompt_financial_analyst_app.md` (spec for "Finly" — a financial analyst dashboard for startups & SMEs) plus `ML_main.zip` (pre-trained LSTM Keras model + MinMaxScaler). Original stack was React + PHP + MySQL + Flask. Adapted to the Emergent platform (React + FastAPI + MongoDB), keeping all 7 functional modules and behaviour intact. Language: Bahasa Indonesia. Currency: IDR.

## Architecture
- **Frontend**: React (CRA) + Tailwind + Recharts + @phosphor-icons/react + react-router-dom v7
- **Backend**: FastAPI + Motor (MongoDB async)
- **ML**: TensorFlow Keras LSTM (in-process inside FastAPI backend; no separate Flask server)
- **Auth**: Server-side bearer tokens (`secrets.token_hex(32)`), 7-day expiry, stored in `sessions` collection; bcrypt for passwords

## Core Requirements (Static)
1. Authentication: register (email validation, bcrypt, 8-char min password), login (bearer token), logout, me; ProtectedRoute on all app routes.
2. Dashboard (Beranda): 4 KPI cards (Pendapatan, Pengeluaran, Laba/Rugi, Jumlah Transaksi) + AreaChart daily income-vs-outcome + BarChart top outcome categories; month picker.
3. Transaksi: toggle pemasukan/pengeluaran; dynamic category dropdown; Rupiah auto-format input; date default hari-ini (max today); inline validation; recent 8 transactions table.
4. Anggaran (Budgeting): dynamic add/remove rows; upsert per category; realisasi vs anggaran table with OK/OVER status + progress bar.
5. Detail Transaksi: filter month/type/category/search; pagination; 4 summary cards; CSV export.
6. Prediksi ML: horizon slider 1-90 + presets 7/14/30; LSTM forecast with terminal-styled results panel; line chart + detail table; auto-saved to history.
7. Riwayat Prediksi: paginated list; detail drawer with chart + full table; delete.

## Design System
- Archetype 4: Swiss & High-Contrast (sharp 0-2px borders, grid lines, no rounded corners)
- Fonts: Chivo (display), IBM Plex Sans (body), JetBrains Mono (numbers/data)
- Palette: `#F7F7F5` bg, `#0A0A0A` ink, `#059669` pos, `#E11D48` neg, `#002FA7`/`#7FB3FF` ML accent
- ML module uses distinct dark "terminal" micro-theme (`bg-[#0A0A0A]` + grid overlay)

## What's Been Implemented (2026-04-23)
- [x] Full backend API at `/api/*` with user data isolation
- [x] LSTM inference (27 base features + 13 temporal = 39 input features, TIME_STEPS=14) with graceful fallback if model unavailable
- [x] All 7 frontend modules working end-to-end
- [x] Rupiah formatting via `Intl.NumberFormat('id-ID', currency: 'IDR')` throughout
- [x] data-testid on every interactive element
- [x] 27/27 backend pytest tests pass, 100% frontend critical flows verified

## User Personas
- **SME Owner**: tracks daily cashflow, monthly budgets, uses forecast for planning procurement.
- **Startup Finance Lead**: monitors revenue/expense trends, runs 30-day forecasts for runway planning.

## Prioritized Backlog
- **P1** Add per-category budget alerts (push/email) when realisasi ≥ 80% anggaran
- **P1** Bulk import transactions from CSV / Excel / bank statements
- **P2** Multi-currency support (USD/SGD for export-heavy SMEs)
- **P2** Shareable monthly financial report PDF
- **P2** Retrain LSTM on user's own historical data when ≥ 180 days available
- **P3** Team / multi-user accounts with role-based access
- **P3** AI assistant (Claude) chat to answer "apa yang membuat laba bulan ini turun?"

## Next Tasks
- Monetisation hook: freemium tier (10 predictions/month free) → Pro (unlimited + AI insights)
- CSV import for onboarding speed
- Model retraining pipeline using user data
