'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Interface disesuaikan dengan kebutuhan ProductCard (price & reward adalah number)
interface Product {
  id: number;
  name: string;
  category: string;
  size: string;
  price: number;
  photo_url?: string;
  seller_id: number;
  reward: number;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fungsi fetchProducts didefinisikan dengan benar untuk menghindari error 'async'
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data produk dari server');
        }

        const data = await response.json();
        
        // Memastikan tipe data price dan reward adalah angka (number) sebelum masuk ke state
        const sanitizedData: Product[] = data.map((p: any) => ({
          ...p,
          price: Number(p.price) || 0,
          reward: Number(p.reward) || 0
        }));

        setProducts(sanitizedData);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-10">
        {/* Judul Halaman */}
        <div className="mb-10">
          <h2 className="text-pink-500 text-2xl font-bold tracking-[0.3em] uppercase">
            MARKETPLACE TERPERCAYA
          </h2>
          <p className="text-gray-400 mt-2">Temukan koleksi thrift eksklusif dengan sistem blockchain.</p>
        </div>

        {/* Notifikasi Error jika gagal fetch */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Tampilan Loading (Skeleton) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
            ))}
          </div>
        ) : (
          /* Daftar Produk */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-xl">Tidak ada produk yang tersedia saat ini.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}