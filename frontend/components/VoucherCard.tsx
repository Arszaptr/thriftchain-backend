'use client';

import React from 'react';

interface VoucherCardProps {
  id?: number | string;
  code?: string;
  discount?: number | string;
  description?: string;
  expiry_date?: string;
}

export default function VoucherCard({ 
  code = "VOUCHER123", 
  discount = "10%", 
  description = "Diskon khusus pengguna baru",
  expiry_date = "31 Dec 2026"
}: VoucherCardProps) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
      {/* Dekorasi Bulatan Putih Khas Voucher */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
      
      <div className="flex flex-col items-center border-2 border-dashed border-white/30 rounded-lg p-3">
        <span className="text-xs uppercase tracking-widest opacity-80">Voucher Code</span>
        <h3 className="text-xl font-bold my-1">{code}</h3>
        <div className="text-2xl font-black mb-1">{discount} OFF</div>
        <p className="text-[10px] text-center opacity-90">{description}</p>
        <div className="mt-2 text-[9px] bg-white/20 px-2 py-1 rounded">
          Expires: {expiry_date}
        </div>
      </div>
    </div>
  );
}