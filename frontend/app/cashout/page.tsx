'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const cashoutMethods = ['GoPay', 'OVO', 'Transfer Bank'];

export default function CashoutPage() {
  const { user } = useAuth();
  const [tokenAmount, setTokenAmount] = useState(100);
  const [method, setMethod] = useState('GoPay');
  const [account, setAccount] = useState('');
  const [history, setHistory] = useState([{
    id: 'c1', amountRp: 2500, method: 'GoPay', date: '11 Mei 2026', ref: 'TC-123456'
  }]);

  const rateRp = useMemo(() => Math.floor((tokenAmount / 100) * 5000), [tokenAmount]);
  const feeRatio = method === 'GoPay' ? 0.015 : method === 'OVO' ? 0.01 : 0.005;
  const fee = Math.floor(rateRp * feeRatio);
  const finalAmount = rateRp - fee;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const ref = `TC-${Math.floor(100000 + Math.random() * 900000)}`;
    setHistory([{ id: ref, amountRp: finalAmount, method, date: '6 Mei 2026', ref }, ...history]);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-brand-dark pb-20 text-white">
      <div className="container">
        <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-brand-pink">Cashout</p>
              <h1 className="mt-3 text-4xl font-black">Tukar token menjadi Rupiah.</h1>
            </div>
            <div className="rounded-3xl bg-brand-mid/80 p-6 text-sm text-slate-200">
              <p>Rate konversi</p>
              <p className="mt-3 text-3xl font-semibold text-white">100 token = Rp 5.000</p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="space-y-6">
              <label className="block text-sm font-semibold text-slate-200">Token yang akan ditukar</label>
              <input type="number" min={100} value={tokenAmount} onChange={(e) => setTokenAmount(Number(e.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-200">Metode pencairan</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none">
                    {cashoutMethods.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-200">Nomor rekening / akun</label>
                  <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="0812xxxx / VA" className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none" />
                </div>
              </div>

              <div className="rounded-3xl bg-brand-mid/70 p-6 text-slate-200">
                <p>Hasil konversi</p>
                <p className="mt-3 text-3xl font-semibold text-white">Rp {finalAmount.toLocaleString('id-ID')}</p>
                <p className="mt-2 text-sm text-slate-400">Fee: Rp {fee.toLocaleString('id-ID')} ({(feeRatio * 100).toFixed(1)}%)</p>
              </div>

              <button type="submit" className="w-full rounded-full bg-brand-pink px-6 py-4 text-sm font-semibold text-white transition hover:bg-pink-400">Cairkan Sekarang</button>
            </div>
          </form>

          <aside className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-pink">Riwayat Cashout</p>
            <div className="mt-6 space-y-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-brand-mid/20 p-5">
                  <p className="text-sm text-slate-300">{item.method} • {item.date}</p>
                  <p className="mt-2 text-lg font-semibold text-white">Rp {item.amountRp.toLocaleString('id-ID')}</p>
                  <p className="mt-2 text-xs text-slate-400">Ref: {item.ref}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      </main>
    </ProtectedRoute>
  );
}
