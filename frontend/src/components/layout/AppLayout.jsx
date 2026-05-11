import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChartNoAxesCombined, Home, KeyRound, LayoutDashboard, Menu, PieChart, PlusCircle, UserRound, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { WalletButton } from '../web3/WalletButton';
import { ChainBadge } from '../web3/ChainBadge';
import { Button } from '../ui/button';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/marketplace', label: 'Marketplace', icon: Building2 },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/register-property', label: 'Register', icon: PlusCircle },
  { to: '/my-properties', label: 'My Assets', icon: WalletCards },
  { to: '/fractional-investments', label: 'Invest', icon: PieChart },
  { to: '/rental-dashboard', label: 'Rentals', icon: KeyRound },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" onClick={onNavigate} className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 via-sky-400 to-violet-400 text-slate-950 shadow-glow">
          <ChartNoAxesCombined className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-black tracking-wide">TERRALINK</p>
          <p className="text-xs text-slate-500">Real estate protocol</p>
        </div>
      </NavLink>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-white/10 text-white shadow-glow' : 'text-slate-400 hover:bg-white/[.06] hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
        <p className="text-sm font-bold text-emerald-100">Protocol TVL</p>
        <p className="mt-1 text-2xl font-black">$128.4M</p>
        <p className="mt-1 text-xs text-slate-400">Audited escrow and fractional ownership flows.</p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-80" />
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-black/30 p-5 backdrop-blur-2xl lg:block">
        <SidebarContent />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-2xl lg:left-72">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[.28em] text-slate-500">Premium dApp</p>
              <h1 className="font-display text-lg font-black text-white sm:text-xl">Tokenized Real Estate Exchange</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><ChainBadge /></div>
            <WalletButton />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside className="h-full w-80 max-w-[86vw] border-r border-white/10 bg-slate-950 p-5" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}>
              <div className="mb-4 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 min-h-screen pt-24 lg:ml-72">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
