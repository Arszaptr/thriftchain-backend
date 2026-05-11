'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🆕 Validasi lebih ketat
    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }

    if (!isLogin && (!email.trim() || !username.trim())) {
      setError('Username dan email harus diisi untuk registrasi');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), email.trim().toLowerCase(), password);
      }
      
      // 🆕 Delay sedikit untuk UX
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (err: any) {
      // 🆕 Error handling lebih spesifik
      let errorMessage = 'Terjadi kesalahan';
      
      if (err.message?.includes('401')) {
        errorMessage = 'Username atau password salah';
      } else if (err.message?.includes('username')) {
        errorMessage = 'Username sudah digunakan';
      } else if (err.message?.includes('email')) {
        errorMessage = 'Email sudah terdaftar';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-brand-gold to-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-slate-900">TC</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-gold to-yellow-400 bg-clip-text text-transparent mb-2">
              ThriftChain
            </h1>
            <p className="text-slate-400 text-sm">Marketplace Barang Bekas Terpercaya</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 bg-slate-700/30 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                isLogin 
                  ? 'bg-gradient-to-r from-brand-gold to-yellow-400 text-slate-900 shadow-lg scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                !isLogin
                  ? 'bg-gradient-to-r from-brand-gold to-yellow-400 text-slate-900 shadow-lg scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username <span className="text-brand-gold">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'Masukkan username' : 'Pilih username unik'}
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 
                           focus:outline-none focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/30 transition-all"
                required
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 
                             focus:outline-none focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/30 transition-all"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>💼</span> Wallet address akan otomatis dibuat
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password <span className="text-brand-gold">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 
                           focus:outline-none focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/30 transition-all"
                required
                disabled={loading}
              />
              <div className="text-xs text-slate-500 mt-1.5">
                {password.length < 6 && password.length > 0 && 'Minimal 6 karakter'}
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-brand-gold/80 hover:text-brand-gold transition-colors">
                  Lupa password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-400 hover:from-brand-gold/90 hover:to-yellow-400/90 
                         disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-4 rounded-xl transition-all 
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : isLogin ? (
                'Masuk ke Akun'
              ) : (
                'Buat Akun Baru'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-5 bg-slate-700/20 border border-slate-600/50 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-slate-400 text-center">
              {isLogin ? (
                <>
                  Belum punya akun?{' '}
                  <button 
                    onClick={toggleForm}
                    disabled={loading}
                    className="text-brand-gold hover:text-yellow-400 font-medium hover:underline transition-colors"
                  >
                    Daftar sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{' '}
                  <button 
                    onClick={toggleForm}
                    disabled={loading}
                    className="text-brand-gold hover:text-yellow-400 font-medium hover:underline transition-colors"
                  >
                    Login sekarang
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              © 2024 ThriftChain. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}