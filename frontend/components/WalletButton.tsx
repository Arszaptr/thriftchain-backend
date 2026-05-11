'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function WalletButton() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className="rounded-full border border-brand-gold bg-brand-gold/10 px-5 py-3 text-sm font-semibold text-brand-gold transition hover:bg-brand-gold/20">
        Login
      </Link>
    );
  }

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'Bronze': return { discount: 5, benefits: ['Akses Marketplace', 'Diskon 5%'] };
      case 'Silver': return { discount: 10, benefits: ['Diskon 10%', 'Free Cashout'] };
      case 'Gold': return { discount: 15, benefits: ['Diskon 15%', 'Cashout Express', 'Prioritas Listing'] };
      case 'Diamond': return { discount: 25, benefits: ['Diskon 25%', 'Fee 0%', 'Badge Eksklusif'] };
      default: return { discount: 0, benefits: [] };
    }
  };

  const tierInfo = getTierBenefits(user.tier);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-full border border-brand-gold bg-brand-gold/10 px-4 py-3 text-sm font-semibold text-brand-gold transition hover:bg-brand-gold/20 flex items-center gap-2"
      >
        <span className="hidden sm:inline">{user.username}</span>
        <span className="text-xs bg-brand-pink/30 px-2 py-1 rounded">{user.tier}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-700">
            <p className="font-semibold text-white">{user.username}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Wallet:</span>
                <span className="text-xs font-semibold text-slate-100 bg-slate-700 px-2 py-1 rounded">{user.wallet_address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Saldo Token:</span>
                <span className="text-lg font-bold text-brand-gold">{user.thrift_tokens.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Tier:</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  user.tier === 'Bronze' ? 'text-amber-700 bg-amber-700/20' :
                  user.tier === 'Silver' ? 'text-gray-300 bg-gray-300/20' :
                  user.tier === 'Gold' ? 'text-yellow-400 bg-yellow-400/20' :
                  'text-cyan-400 bg-cyan-400/20'
                }`}>
                  {user.tier}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Diskon:</span>
                <span className="text-sm font-semibold text-green-400">{tierInfo.discount}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-700">
            <p className="text-sm font-semibold text-slate-200 mb-2">Benefit Tier:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              {tierInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/dashboard" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Dashboard
          </Link>
          <Link href="/marketplace" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Marketplace
          </Link>
          <Link href="/sell" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Jual Produk
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 border-t border-slate-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
