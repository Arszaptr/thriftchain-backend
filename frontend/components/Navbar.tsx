import Link from 'next/link';
import Image from 'next/image';
import WalletButton from './WalletButton';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/sell', label: 'Jual Produk' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cashout', label: 'Cashout' },
];

export default function Navbar() {
  return (
    <header className="py-5 border-b border-slate-700">
      <div className="container flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="ThriftChain" width={40} height={40} className="w-10 h-10" />
          <span className="text-2xl font-black text-brand-gold hidden sm:inline">ThriftChain</span>
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap gap-4 text-sm text-slate-200">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-pink">
                {item.label}
              </Link>
            ))}
          </nav>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
