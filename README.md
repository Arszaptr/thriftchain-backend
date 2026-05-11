# ThriftChain MVP

## Struktur Proyek
- `frontend/` — Next.js 14 App Router dengan TailwindCSS
- `backend/` — Python FastAPI dengan SQLite

## Menjalankan Frontend
```bash
cd thriftchain/frontend
npm install
npm run dev
```
Buka: `http://localhost:3000`

## Menjalankan Backend
```bash
cd thriftchain/backend
pip install -r requirements.txt
python main.py
```
API berjalan di: `http://localhost:8000`
Dokumentasi: `http://localhost:8000/docs`

## Fitur MVP
- Halaman landing modern dengan tema deep purple / hot pink
- Marketplace daftar produk thrift
- Dashboard user dengan saldo token dan tier
- Cashout simulasi token ke Rupiah
- Backend FastAPI dengan transaksi token reward, cashout, dan rekomendasi AI
- Simulasi wallet connect di frontend
