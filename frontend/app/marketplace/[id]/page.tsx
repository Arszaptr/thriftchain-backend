'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Gagal mengambil data produk');
        const data = await response.json();
        
        const sanitizedData = data.map((p: any) => ({
          ...p,
          price: Number(p.price) || 0,
          reward: Number(p.reward) || 0
        }));

        setProducts(sanitizedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-pink-500 text-2xl font-bold tracking-[0.3em] uppercase">
            MARKETPLACE TERPERCAYA
          </h2>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}