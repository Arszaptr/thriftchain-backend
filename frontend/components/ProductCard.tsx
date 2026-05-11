'use client';

import Image from 'next/image';

export default function ProductCard({ name, price, photo_url, reward }: any) {
  const handleBuy = () => {
    // Logika integrasi Solana Wallet/Anchor akan ditaruh di sini
    alert(`Konfirmasi pembelian ${name} seharga Rp ${price.toLocaleString()}?`);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition">
      <div className="relative h-48 w-full bg-gray-800">
        <Image src={photo_url || '/placeholder.jpg'} alt={name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-yellow-400 font-bold">Rp {price.toLocaleString()}</p>
        <p className="text-xs text-green-400 mt-1">+{reward} Thrift Points</p>
        
        <button 
          onClick={handleBuy}
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}