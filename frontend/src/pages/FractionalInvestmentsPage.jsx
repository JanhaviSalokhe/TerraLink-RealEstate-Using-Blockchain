import { PieChart, TrendingUp, Users, WalletCards } from 'lucide-react';
import { useAccount } from 'wagmi';
import { PageShell } from '../components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { StatCard } from '../components/dashboard/StatCard';
import { formatCurrency } from '../lib/utils';
import { EmptyState } from '../components/ui/empty-state';
import { useProperties } from '../hooks/useProperties';
import { useProtocolActions } from '../hooks/useProtocolActions';
import { TransactionModal } from '../components/web3/TransactionModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

function sameAddress(left = '', right = '') {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function FractionalInvestmentsPage() {
  const { address } = useAccount();
  const { properties } = useProperties();
  const pools = properties.filter((property) => property.hasPool);
  const actions = useProtocolActions();
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');
  const totalRaised = pools.reduce((sum, property) => sum + Number(property.totalRaised || 0), 0);
  const totalBackers = pools.reduce((sum, property) => sum + Number(property.backerCount || 0), 0);

  async function runPoolAction(action, successMessage) {
    setTxOpen(true);
    setTxStatus('pending');
    try {
      const result = await action();
      if (!result) {
        setTxStatus('idle');
        setTxOpen(false);
        return;
      }
      setTxStatus('success');
      toast.success(successMessage);
    } catch (error) {
      setTxStatus('error');
      toast.error(error.shortMessage || error.message || 'Pool transaction failed');
    }
  }

  async function contribute(property) {
    const amount = window.prompt('Contribution amount in mUSDT', '1000');
    if (!amount) return;
    return runPoolAction(async () => {
      await actions.approveFractional(amount);
      return actions.investInProperty(property.id, amount);
    }, 'Contribution confirmed');
  }

  async function depositIncome(property) {
    const amount = window.prompt('Rental income amount to deposit in mUSDT', String(property.rent || '1000'));
    if (!amount) return;
    return runPoolAction(async () => {
      await actions.approveFractional(amount);
      return actions.depositFractionalRentalIncome(property.id, amount);
    }, 'Rental income deposited');
  }

  async function claimPayout(property) {
    return runPoolAction(() => actions.claimFractionalPayout(property.id), 'Payout claimed');
  }

  return (
    <PageShell eyebrow="Fractional Pools" title="Invest in property, one token at a time" description="Track funding progress, APY, investor participation, and contribution history for live real-estate pools.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={PieChart} label="Active Pools" value={String(pools.length)} trend="Sepolia" />
        <StatCard icon={TrendingUp} label="Total Raised" value={formatCurrency(totalRaised, true)} trend="mUSDT" tone="blue" />
        <StatCard icon={Users} label="Backers" value={String(totalBackers)} trend="on-chain" tone="violet" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {pools.map((property) => {
          const isOwner = sameAddress(address, property.owner);
          const remaining = Math.max(Number(property.targetAmount || 0) - Number(property.totalRaised || 0), 0);

          return (
            <Card key={property.id}>
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
                <img src={property.image} alt={property.title} className="h-44 w-full rounded-xl object-cover sm:h-full" />
                <div className="space-y-4">
                  <div className="flex justify-between gap-3">
                    <div><h3 className="text-xl font-black">{property.title}</h3><p className="text-sm text-slate-400">{property.location}</p></div>
                    <p className="text-right text-xl font-black text-emerald-300">{property.apy}%</p>
                  </div>
                  <Progress value={property.funded} />
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{property.funded}%</p><p className="text-xs text-slate-500">Funded</p></div>
                    <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(property.totalRaised, true)}</p><p className="text-xs text-slate-500">Raised</p></div>
                    <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{property.backerCount || 0}</p><p className="text-xs text-slate-500">Backers</p></div>
                  </div>
                  <div className="grid gap-2 rounded-xl bg-white/[.035] p-3 text-xs text-slate-400 sm:grid-cols-2">
                    <p>Target: {formatCurrency(property.targetAmount, true)}</p>
                    <p>Remaining: {formatCurrency(remaining, true)}</p>
                    <p>Your stake: {formatCurrency(property.viewerContribution, true)}</p>
                    <p>Pending payout: {formatCurrency(property.viewerPendingPayout, true)}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button onClick={() => contribute(property)} disabled={remaining <= 0}><WalletCards className="h-4 w-4" />Contribute</Button>
                    <Button variant="outline" onClick={() => claimPayout(property)} disabled={!property.viewerPendingPayout}>Claim Payout</Button>
                    {isOwner && <Button className="sm:col-span-2" variant="secondary" onClick={() => depositIncome(property)}>Deposit Rental Income</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {!pools.length && <div className="mt-8"><EmptyState title="No fractional pools yet" description="An owner can open a pool from My Assets. Once FractionalInvestmentEnabled is mined, the pool appears here." /></div>}
      <Card className="mt-8">
        <CardHeader><CardTitle>Contribution History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {pools.map((pool) => (
            <div key={pool.id} className="rounded-xl bg-white/[.05] p-3 text-sm text-slate-300">{pool.title}: {formatCurrency(pool.totalRaised)} raised toward {formatCurrency(pool.targetAmount)} from {pool.backerCount || 0} backer{pool.backerCount === 1 ? '' : 's'}.</div>
          ))}
          {!pools.length && <p className="text-sm text-slate-400">No Invested events to summarize yet.</p>}
        </CardContent>
      </Card>
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} status={txStatus} hash={actions.hash} />
    </PageShell>
  );
}
