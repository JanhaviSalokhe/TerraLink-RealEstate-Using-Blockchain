import { Banknote, Building2, CircleDollarSign, TrendingUp } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { PropertyCard } from '../components/property/PropertyCard';
import { EmptyState } from '../components/ui/empty-state';
import { useOwnedProperties } from '../hooks/useProperties';
import { formatCurrency } from '../lib/utils';

export function DashboardPage() {
  const { properties, allProperties } = useOwnedProperties();
  const portfolioValue = properties.reduce((sum, property) => sum + Number(property.price || 0), 0);
  const rentalEarnings = properties.reduce((sum, property) => sum + Number(property.rent || 0), 0);

  return (
    <PageShell eyebrow="Dashboard" title="Portfolio command center" description="Track tokenized assets, rent distributions, investment pools, and transaction health across your wallet.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Portfolio Value" value={formatCurrency(portfolioValue, true)} trend={`${properties.length} owned`} />
        <StatCard icon={Banknote} label="Monthly Rent" value={formatCurrency(rentalEarnings, true)} trend="on-chain" tone="blue" />
        <StatCard icon={TrendingUp} label="Live Pools" value={String(allProperties.filter((item) => item.hasPool).length)} trend="Sepolia" tone="violet" />
        <StatCard icon={CircleDollarSign} label="Marketplace" value={String(allProperties.filter((item) => item.isListed).length)} trend="listed" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card><CardHeader><CardTitle>Portfolio Analytics</CardTitle></CardHeader><CardContent><PortfolioChart /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Transaction Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {allProperties.slice(0, 6).map((item) => (
              <div key={item.id} className="flex justify-between rounded-xl bg-white/[.05] p-3">
                <div><p className="font-bold">{item.title}</p><p className="text-xs text-slate-500">{item.metadataURI}</p></div>
                <div className="text-right"><p className="text-sm">{item.stateLabel}</p><p className="text-xs text-slate-500">Token {item.tokenId}</p></div>
              </div>
            ))}
            {!allProperties.length && <p className="text-sm text-slate-400">No protocol activity found from PropertyRegistered events yet.</p>}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
      {!properties.length && <div className="mt-8"><EmptyState title="Connect an owner wallet" description="Owned properties and earnings appear here after your connected wallet registers or receives TLAND NFTs." /></div>}
    </PageShell>
  );
}
