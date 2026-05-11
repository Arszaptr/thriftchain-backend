import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ThriftChain",
  description: "Blockchain Loyalty Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a192f] text-white min-h-screen">
        <AuthProvider>
          {/* --- BAGIAN 1: LOGO BESAR (Akan Tertutup Saat Scroll) --- */}
          <div className="w-full bg-[#0a192f] py-10 flex justify-center border-b border-white/5">
            <Link href="/" className="w-full max-w-5xl px-4">
              <Image 
                src="/logo-project.jpg" 
                alt="ThriftChain Logo"
                width={1200}
                height={400}
                priority
                className="w-full h-auto object-contain rounded-xl shadow-2xl"
              />
            </Link>
          </div>

          {/* --- BAGIAN 2: NAVIGASI (Sticky - Tetap di Atas) --- */}
          <header className="bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-[100] py-4 shadow-xl">
            <nav className="container mx-auto px-4 flex flex-wrap justify-center items-center gap-6 md:gap-10">
              <Link href="/" className="hover:text-yellow-400 transition font-medium">Beranda</Link>
              <Link href="/marketplace" className="hover:text-yellow-400 transition font-medium">Marketplace</Link>
              <Link href="/sell" className="hover:text-yellow-400 transition font-medium">Jual Produk</Link>
              <Link href="/dashboard" className="hover:text-yellow-400 transition font-medium">Dashboard</Link>
              <Link href="/cashout" className="hover:text-yellow-400 transition font-medium">Cashout</Link>
              
              <Link href="/login" className="bg-yellow-500 text-black px-5 py-2 rounded-full hover:bg-yellow-400 transition font-bold text-sm">
                Login
              </Link>
            </nav>
          </header>

          {/* --- ISI HALAMAN --- */}
          <main className="relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}