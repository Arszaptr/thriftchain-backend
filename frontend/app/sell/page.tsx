'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import Image from 'next/image';

export default function SellPage() {
  const { user, loading } = useAuth();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Pakaian',
    size: '',
    condition: 'Baik'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }

    const productData = {
      seller_id: user.id,
      name: formData.name,
      category: formData.category,
      size: formData.size,
      price: parseInt(formData.price),
      description: formData.description,
      condition: formData.condition,
      photo_url: 'https://via.placeholder.com/300', 
    };

    try {
      const response = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('Produk berhasil disimpan!');
        window.location.href = '/marketplace';
      } else {
        alert('Gagal menyimpan produk.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-pink-500 text-3xl font-bold tracking-widest uppercase mb-2 text-center">
            Jual Barang Thrift
          </h2>
          <p className="text-gray-400 text-center mb-10">Berikan detail sejujur mungkin untuk pembeli Anda.</p>

          <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            
            {/* UNGGAH FOTO */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Foto Produk (Wajib)</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-4 hover:border-yellow-500/50 transition cursor-pointer bg-white/5 relative h-64 overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400">Klik untuk upload foto barang</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageChange}
                  required
                />
              </div>
            </div>

            {/* NAMA & HARGA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nama Barang</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent text-white"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Harga (IDR)</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent text-white"
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* DESKRIPSI */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Deskripsi</label>
              <textarea 
                rows={4}
                className="w-full p-3 bg-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent resize-none text-white"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              ></textarea>
            </div>

            {/* KATEGORI */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Kategori</label>
              <select 
                className="w-full p-3 bg-[#1e293b] rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent text-white"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                value={formData.category}
              >
                <option value="Atasan">Atasan</option>
                <option value="Bawahan">Bawahan</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Dress">Dress</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Sepatu">Sepatu</option>
              </select>
            </div>

            {/* UKURAN & KONDISI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Ukuran</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-white/10 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent text-white"
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Kondisi</label>
                <select 
                  className="w-full p-3 bg-[#1e293b] rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent text-white"
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  value={formData.condition}
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Ada Minus">Ada Minus</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-yellow-500 text-black font-bold rounded-2xl hover:bg-yellow-400 transition shadow-lg text-lg uppercase"
            >
              Daftarkan ke ThriftChain
            </button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
