import TierBadge from '@/components/TierBadge';

const tiers = [
  { tier: 'Bronze', subtitle: 'Akses Marketplace', description: 'Mulai kumpulkan token dan dapatkan akses beli produk thrift.', highlight: false },
  { tier: 'Silver', subtitle: 'Diskon 5%', description: 'Diskon marketplace dan prioritas listing untuk seller.', highlight: false },
  { tier: 'Gold', subtitle: 'Diskon 15%', description: 'Cashout express dan keuntungan loyalty lebih besar.', highlight: true },
  { tier: 'Diamond', subtitle: 'Fee 0%', description: 'Pencairan tanpa biaya dan badge eksklusif.', highlight: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-dark pb-20">
      <div className="container">
        <section className="grid gap-8 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-pink">Marketplace Terpercaya</p>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">Belanja thrift, kumpul poin, cair jadi Rupiah.</h1>
            <p className="max-w-2xl text-lg text-slate-300">Platform thrift fashion berbasis Solana dengan token loyalty yang bisa ditukar ke GoPay, OVO, atau Rekening Bank.</p>
            <div className="flex flex-wrap gap-4">
              <a href="/marketplace" className="rounded-full bg-brand-pink px-8 py-4 text-sm font-semibold text-white transition hover:bg-pink-400">Mulai Belanja</a>
              <a href="/marketplace" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm text-white transition hover:border-brand-gold">Jual Bajumu</a>
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="rounded-3xl bg-brand-mid/70 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">Statistik</p>
                <div className="mt-6 space-y-4 text-xl">
                  <p><span className="font-semibold text-brand-gold">$393B</span> pasar thrift global</p>
                  <p><span className="font-semibold text-brand-gold">64%</span> Gen Z pilih thrift</p>
                  <p><span className="font-semibold text-brand-gold">0</span> platform dengan reward on-chain</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {tiers.map((item) => (
                  <div key={item.tier} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">{item.tier}</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">{item.subtitle}</h2>
                    <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[3rem] bg-brand-mid/30 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-4">
            {['Daftar', 'Beli/Jual', 'Kumpul Token', 'Cair ke Rupiah'].map((step, index) => (
              <div key={step} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink text-lg font-bold text-white">{index + 1}</div>
                <h3 className="text-xl font-semibold text-white">{step}</h3>
                <p className="text-sm text-slate-300">{step === 'Daftar' ? 'Buat akun demo dan siap bertransaksi.' : step === 'Beli/Jual' ? 'Pilih produk thrift pilihan atau jual barangmu di platform.' : step === 'Kumpul Token' ? 'Dapatkan token loyalty setiap transaksi.' : 'Tukar token jadi Rupiah di halaman cashout.'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-24 border-t border-white/10 py-10 text-center text-sm text-slate-400">
        <div className="container">ThriftChain — MVP hackathon. Simulasi wallet dan cashout lokal.</div>
      </footer>
    </main>
  );
}
