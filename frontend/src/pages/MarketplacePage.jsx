import { SlidersHorizontal, Search, ArrowUpDown } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PropertyCard } from '../components/property/PropertyCard';
import { properties } from '../data/properties';

export function MarketplacePage() {
  return (
    <PageShell eyebrow="Marketplace" title="Discover tokenized luxury properties" description="Search verified property NFTs, rental yield assets, and fractional investment pools with live on-chain context.">
      <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 backdrop-blur-xl md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input className="pl-10" placeholder="Search city, property, token ID" />
        </div>
        <Button variant="secondary"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
        <Button variant="outline"><ArrowUpDown className="h-4 w-4" />Sort by APY</Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['All', 'Fractional NFT', 'Rental Yield', 'Blue Chip NFT', 'New Listing', 'Sepolia'].map((label, index) => <Badge key={label} variant={index % 2 ? 'blue' : 'emerald'}>{label}</Badge>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
        <div className="sticky top-28 h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-grid bg-[length:32px_32px]">
          <div className="absolute inset-0 bg-aurora opacity-50" />
          {properties.map((property, index) => (
            <div key={property.id} className="absolute rounded-full border border-emerald-200/40 bg-emerald-300/20 px-3 py-1 text-xs font-bold text-emerald-100 shadow-glow" style={{ left: `${20 + index * 15}%`, top: `${18 + (index * 19) % 62}%` }}>
              {property.location.split(',')[0]}
            </div>
          ))}
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
            <p className="font-bold">Live map intelligence</p>
            <p className="mt-1 text-sm text-slate-400">Yield heat, occupancy, deed confidence, and pool depth overlays.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
