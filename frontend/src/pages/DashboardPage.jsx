import { Banknote, Building2, CircleDollarSign, TrendingUp } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { PropertyCard } from '../components/property/PropertyCard';
import { activity, properties } from '../data/properties';

export function DashboardPage() {
  return (
    <PageShell eyebrow="Dashboard" title="Portfolio command center" description="Track tokenized assets, rent distributions, investment pools, and transaction health across your wallet.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Portfolio Value" value="$8.42M" trend="+18.4%" />
        <StatCard icon={Banknote} label="Rental Earnings" value="$74.8K" trend="+9.1%" tone="blue" />
        <StatCard icon={TrendingUp} label="Investment Yield" value="11.7%" trend="+2.6%" tone="violet" />
        <StatCard icon={CircleDollarSign} label="Claimable USDC" value="$18.3K" trend="Ready" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card><CardHeader><CardTitle>Portfolio Analytics</CardTitle></CardHeader><CardContent><PortfolioChart /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Transaction Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activity.concat(activity.slice(0, 2)).map((item, index) => (
              <div key={`${item.hash}-${index}`} className="flex justify-between rounded-xl bg-white/[.05] p-3">
                <div><p className="font-bold">{item.type}</p><p className="text-xs text-slate-500">{item.hash}</p></div>
                <div className="text-right"><p className="text-sm">{item.value}</p><p className="text-xs text-slate-500">{item.time}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </PageShell>
  );
}
