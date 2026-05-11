'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

interface Transaction {
  id: number;
  type: string;
  product_name: string;
  tokens: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const safeTokenBalance = (tokens: any): number => {
    if (tokens == null) return 0;
    return parseFloat(tokens) || 0;
  };

  const tokenBalance = safeTokenBalance(user?.thrift_tokens);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => null);
        
        if (response?.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const copyToClipboard = async (text: string) => {
    if (!text) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTierInfo = (tokens: number) => {
    if (tokens >= 5000) return { level: 'Diamond', color: 'text-cyan-400', benefit: 'Diskon 25% + Cashout priority' };
    if (tokens >= 2000) return { level: 'Gold', color: 'text-yellow-400', benefit: 'Diskon 15% + Cashout express' };
    if (tokens >= 500) return { level: 'Silver', color: 'text-gray-300', benefit: 'Diskon 10% + Free cashout' };
    return { level: 'Bronze', color: 'text-amber-700', benefit: 'Diskon 5%' };
  };

  const tier = getTierInfo(tokenBalance);
  const nextTierTokens = 
    tokenBalance >= 5000 ? 5000 :
    tokenBalance >= 2000 ? 5000 :
    tokenBalance >= 500 ? 2000 : 500;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-brand-dark pb-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-pink">Dashboard User</p>
            <h1 className="mt-3 text-4xl font-black">Selamat datang, {user?.username || 'User'}!</h1>
            <p className="mt-3 text-sm text-slate-300">Kelola token, lihat tier, dan riwayat transaksi Anda di sini.</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Token Balance */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-gold/20 to-transparent border border-brand-gold/30 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-gold">Saldo Token</p>
              <p className="mt-4 text-5xl font-black text-brand-gold">{tokenBalance.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-300">≈ Rp {Math.floor(tokenBalance * 50).toLocaleString('id-ID')}</p>
              <Link href="/cashout" className="mt-4 inline-block rounded-full bg-brand-gold text-slate-900 px-6 py-2 text-sm font-semibold hover:bg-yellow-300 transition-all">
                Cashout →
              </Link>
            </div>

            {/* Tier Info */}
            <div className={`rounded-2xl bg-white/5 border border-white/10 p-6`}>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tier Saat Ini</p>
              <p className={`mt-4 text-4xl font-black ${tier.color}`}>{tier.level}</p>
              <p className="mt-2 text-xs text-slate-400">Benefit: {tier.benefit}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Progres</span>
                  <span>{tokenBalance.toFixed(0)}/{nextTierTokens}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 transition-all duration-500"
                    style={{
                      width: `${Math.min((tokenBalance / nextTierTokens) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="relative group rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-brand-gold/50 transition-all">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Wallet Address</p>
              <p 
                className="mt-4 text-sm font-mono text-brand-gold break-all select-all cursor-pointer hover:text-yellow-300 transition-colors p-2 rounded pr-10 bg-white/5 group-hover:bg-brand-gold/10"
                onClick={() => copyToClipboard(user?.wallet_address || '')}
                title={user?.wallet_address}
              >
                {user?.wallet_address ? 
                  `${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-6)}` : 
                  'Belum disetel'
                }
              </p>
              <p className="mt-2 text-xs text-slate-400">Email: {user?.email || 'Belum terdaftar'}</p>
              
              {showToast && (
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-green-500/95 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xs shadow-2xl border border-green-600/50 font-medium">
                  {user?.wallet_address ? '✅ Address tersalin!' : '⚠️ Belum ada wallet'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link href="/marketplace" className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-brand-gold hover:bg-white/10 transition-all hover:-translate-y-1">
              <p className="font-semibold text-xl group-hover:text-brand-gold transition-colors">🛍️ Jelajahi Marketplace</p>
              <p className="text-sm text-slate-400 mt-2">Cari dan beli barang thrift favorit Anda</p>
            </Link>
            <Link href="/sell" className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-brand-mint hover:bg-white/10 transition-all hover:-translate-y-1">
              <p className="font-semibold text-xl group-hover:text-brand-mint transition-colors">📤 Jual Barang</p>
              <p className="text-sm text-slate-400 mt-2">Upload barang Anda dan mulai dapatkan token</p>
            </Link>
          </div>

          {/* Transaction History */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Riwayat Transaksi</h2>
              <Link href="/transactions" className="text-sm text-brand-gold hover:underline">Lihat semua →</Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10 border-b border-white/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Tipe</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Produk</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Token</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.type === 'buy' 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}>
                              {tx.type === 'buy' ? '🛒 Beli' : '📤 Jual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300 font-medium">{tx.product_name}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-brand-mint">
                            {tx.type === 'buy' ? `-${tx.tokens}` : `+${tx.tokens}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {new Date(tx.created_at).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-slate-400">📊</span>
                </div>
                <p className="text-slate-400 text-lg mb-4">Belum ada transaksi</p>
                <Link href="/marketplace" className="inline-block bg-brand-gold text-slate-900 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-all">
                  Mulai Berbelanja →
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-brand-gold/50 hover:bg-white/10 transition-all">
              <p className="text-3xl font-bold text-brand-gold group-hover:scale-110 transition-transform">{transactions.filter(t => t.type === 'buy').length}</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Barang Dibeli</p>
            </div>
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-brand-mint/50 hover:bg-white/10 transition-all">
              <p className="text-3xl font-bold text-brand-mint group-hover:scale-110 transition-transform">{transactions.filter(t => t.type === 'sell').length}</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Barang Dijual</p>
            </div>
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-brand-pink/50 hover:bg-white/10 transition-all">
              <p className="text-3xl font-bold text-brand-pink group-hover:scale-110 transition-transform">{transactions.length}</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Total Transaksi</p>
            </div>
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-6 text-center hover:border-cyan-400/50 hover:bg-white/10 transition-all">
              <p className={`text-3xl font-black ${tier.color} group-hover:scale-110 transition-transform`}>{tier.level}</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Status Member</p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
