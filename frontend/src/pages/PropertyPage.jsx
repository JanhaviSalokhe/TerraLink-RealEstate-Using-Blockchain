import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Activity, ArrowRight, Banknote, Building2, CalendarClock, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { TransactionModal } from '../components/web3/TransactionModal';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { EmptyState } from '../components/ui/empty-state';
import { formatCurrency, shortAddress } from '../lib/utils';
import { useProtocolActions } from '../hooks/useProtocolActions';
import { useProperty } from '../hooks/useProperties';
import toast from 'react-hot-toast';

export function PropertyPage() {
  const { id } = useParams();
  const { address } = useAccount();
  const [selected, setSelected] = useState(0);
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');
  const { approveMarketplace, approveRental, approveFractional, buyProperty, acceptRentalAgreement, investInProperty, depositFractionalRentalIncome, claimFractionalPayout, hash } = useProtocolActions();
  const { property, isLoading, error } = useProperty(id);

  async function runAction(action) {
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
      toast.success('Transaction confirmed on Sepolia');
    } catch (error) {
      setTxStatus('error');
      toast.error(error.shortMessage || error.message || 'Transaction failed');
    }
  }

  const isOwner = property?.owner?.toLowerCase() === address?.toLowerCase();

  async function investCustomAmount() {
    const amount = window.prompt('Investment amount in mUSDT', '1000');
    if (!amount) return;
    return runAction(async () => {
      await approveFractional(amount);
      return investInProperty(property.id, amount);
    });
  }

  async function depositRentalIncome() {
    const amount = window.prompt('Rental income amount to deposit in mUSDT', String(property.rent || '1000'));
    if (!amount) return;
    return runAction(async () => {
      await approveFractional(amount);
      return depositFractionalRentalIncome(property.id, amount);
    });
  }

  if (!property && !isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <EmptyState title="Property not found on Sepolia" description={error || `No PropertyRegistered event was found for token ${id}. Check VITE_DEPLOYMENT_BLOCK or register a property first.`} />
      </section>
    );
  }

  if (!property) {
    return <section className="mx-auto max-w-7xl px-4 pb-16 text-slate-400 sm:px-6 lg:px-8">Loading on-chain property...</section>;
  }

  const events = [
    { type: 'Registered', hash: property.metadataURI, value: property.stateLabel, time: property.createdAt ? new Date(property.createdAt * 1000).toLocaleDateString() : 'Sepolia' },
    property.isListed && { type: 'Listed', hash: `Seller ${shortAddress(property.listing.seller)}`, value: formatCurrency(property.price), time: 'Marketplace' },
    property.hasPool && { type: 'Fractional pool', hash: `${property.funded}% funded`, value: formatCurrency(property.totalRaised), time: 'Pool live' },
    property.hasRental && { type: 'Rental agreement', hash: `Tenant ${shortAddress(property.rental.tenant)}`, value: formatCurrency(property.rent), time: property.rental.active ? 'Active' : 'Open' },
  ].filter(Boolean);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">
          <img src={property.gallery[selected] || property.image} alt={property.title} className="h-[520px] w-full object-cover" />
          <div className="grid grid-cols-3 gap-2 p-2">
            {property.gallery.map((image, index) => (
              <button key={image} onClick={() => setSelected(index)} className={`overflow-hidden rounded-xl border ${selected === index ? 'border-emerald-300' : 'border-white/10'}`}>
                <img src={image} alt="" className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <Badge>{property.badge}</Badge>
                <h1 className="mt-3 text-4xl font-black">{property.title}</h1>
                <p className="mt-2 text-slate-400">{property.location}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-400">Asset value</p>
                <p className="text-4xl font-black text-gradient">{property.price ? formatCurrency(property.price) : 'Unlisted'}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[['Beds', property.beds || '-'], ['Baths', property.baths || '-'], ['Sqft', property.sqft ? property.sqft.toLocaleString() : '-'], ['State', property.stateLabel]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/[.05] p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Investment Analytics</CardTitle></CardHeader>
            <CardContent><PortfolioChart /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Blockchain Activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {events.map((item) => (
                <div key={`${item.type}-${item.hash}`} className="flex items-center justify-between rounded-xl bg-white/[.05] p-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-emerald-300" />
                    <div><p className="font-bold">{item.type}</p><p className="text-xs text-slate-500">{item.hash}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm">{item.value}</p><p className="text-xs text-slate-500">{item.time}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 p-5">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-300/15 via-sky-400/10 to-violet-400/15 p-4">
              <p className="text-sm text-slate-400">Ownership token</p>
              <p className="text-2xl font-black">{property.tokenId}</p>
              <p className="mt-1 text-sm text-slate-400">Owner {shortAddress(property.owner)}</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Pool funded</span><span>{property.funded}%</span></div>
              <Progress value={property.funded} />
            </div>
            <div className="grid gap-3">
              {property.isListed && <Button variant="outline" onClick={() => runAction(() => approveMarketplace(property.price))}>Approve {formatCurrency(property.price)} mUSDT</Button>}
              {property.isListed && <Button onClick={() => runAction(() => buyProperty(property.id))}><Building2 className="h-4 w-4" />Buy NFT</Button>}
              {property.hasRental && !property.rental.active && <Button variant="secondary" onClick={() => runAction(async () => { await approveRental(property.rent + Number(property.rental.securityDeposit || 0n) / 1e6); return acceptRentalAgreement(property.id); })}><CalendarClock className="h-4 w-4" />Accept Rental Escrow</Button>}
              {property.hasPool && <Button variant="outline" onClick={investCustomAmount}><TrendingUp className="h-4 w-4" />Invest</Button>}
              {property.hasPool && <Button variant="secondary" onClick={() => runAction(() => claimFractionalPayout(property.id))} disabled={!property.viewerPendingPayout}>Claim {formatCurrency(property.viewerPendingPayout || 0, true)}</Button>}
              {property.hasPool && isOwner && <Button variant="outline" onClick={depositRentalIncome}>Deposit Rental Income</Button>}
              {!property.isListed && !property.hasRental && !property.hasPool && <p className="rounded-xl bg-white/[.05] p-3 text-sm text-slate-400">This asset is registered but not listed, rented, or fractionalized yet.</p>}
            </div>
            <div className="space-y-3 text-sm">
              {[ShieldCheck, Banknote, ExternalLink].map((Icon, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-300">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  {['Verified title deed and escrow-ready rental terms', `${formatCurrency(property.rent)}/mo projected rent`, 'Metadata, deed hash, and pool data visible on-chain'][index]}
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full">View legal packet <ArrowRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      </aside>
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} status={txStatus} hash={hash} />
    </section>
  );
}
