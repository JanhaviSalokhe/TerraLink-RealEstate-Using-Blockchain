import { PageShell } from '../components/layout/PageShell';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOwnedProperties } from '../hooks/useProperties';
import { useProtocolActions } from '../hooks/useProtocolActions';
import { TransactionModal } from '../components/web3/TransactionModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

function OwnerActions({ property, runAction }) {
  const canStartProtocolFlow = property.state === 0 && !property.isListed && !property.hasRental && !property.hasPool;
  const isListed = property.isListed;
  const hasRental = property.hasRental;
  const hasPool = property.hasPool;

  return (
    <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-3">
      {canStartProtocolFlow && (
        <>
          <Button variant="outline" onClick={() => runAction(async ({ approveMarketplaceOperator, listProperty }) => {
            const price = window.prompt('Listing price in mUSDT', String(property.price || '100000'));
            if (!price) return;
            await approveMarketplaceOperator();
            return listProperty(property.id, price);
          })}>List for Sale</Button>
          <Button variant="outline" onClick={() => runAction(async ({ approveFractionalOperator, enableFractionalInvestment }) => {
            const target = window.prompt('Fractional funding target in mUSDT', String(property.price || '100000'));
            if (!target) return;
            await approveFractionalOperator();
            return enableFractionalInvestment(property.id, target);
          })}>Open Fractional Pool</Button>
          <Button variant="outline" onClick={() => runAction(async ({ approveRentalOperator, createRentalAgreement }) => {
            const rent = window.prompt('Monthly rent in mUSDT', String(property.rent || '1000'));
            if (!rent) return;
            const deposit = window.prompt('Security deposit in mUSDT', String(Number(rent) * 2));
            if (!deposit) return;
            const duration = window.prompt('Rental duration in days', '365');
            if (!duration) return;
            await approveRentalOperator();
            return createRentalAgreement(property.id, '0x0000000000000000000000000000000000000000', rent, deposit, duration);
          })}>Create Open Rental</Button>
        </>
      )}

      {isListed && (
        <>
          <Button variant="outline" onClick={() => runAction(async ({ updateListingPrice }) => {
            const price = window.prompt('New listing price in mUSDT', String(property.price || '100000'));
            if (!price) return;
            return updateListingPrice(property.id, price);
          })}>Update Listing Price</Button>
          <Button variant="danger" onClick={() => runAction(({ cancelListing }) => cancelListing(property.id))}>Cancel Listing</Button>
        </>
      )}

      {hasRental && <p className="rounded-xl bg-white/[.04] p-3 text-xs text-slate-400">Rental controls are available from the Rental Escrow dashboard.</p>}
      {hasPool && <p className="rounded-xl bg-white/[.04] p-3 text-xs text-slate-400">Pool deposits, payouts, and investor controls are available from the Fractional Pools dashboard.</p>}
      {!canStartProtocolFlow && !isListed && !hasRental && !hasPool && <p className="rounded-xl bg-white/[.04] p-3 text-xs text-slate-400">This asset is not in a protocol-startable state.</p>}
    </div>
  );
}

export function MyPropertiesPage() {
  const { properties, isLoading, error } = useOwnedProperties();
  const actions = useProtocolActions();
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');

  async function runAction(action) {
    setTxOpen(true);
    setTxStatus('pending');
    try {
      const result = await action(actions);
      if (!result) {
        setTxStatus('idle');
        setTxOpen(false);
        return;
      }
      setTxStatus('success');
      toast.success('Transaction confirmed on Sepolia');
    } catch (actionError) {
      setTxStatus('error');
      toast.error(actionError.shortMessage || actionError.message || 'Transaction failed');
    }
  }

  return (
    <PageShell
      eyebrow="My Properties"
      title="Your tokenized real estate vault"
      description="Manage owned NFTs, rental rights, fractional positions, and listing status."
      action={<Button asChild><Link to="/register-property"><PlusCircle className="h-4 w-4" />Register asset</Link></Button>}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[580px]" />)}
        {!isLoading && properties.map((property) => (
          <div key={property.id}>
            <PropertyCard property={property} />
            <OwnerActions property={property} runAction={runAction} />
          </div>
        ))}
      </div>
      {!isLoading && !properties.length && <EmptyState title="No owned properties in this wallet" description={error || 'Connect the wallet that registered a property, or mint a new PropertyNFT from the registration flow.'} action={<Button asChild><Link to="/register-property">Register Property</Link></Button>} />}
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} status={txStatus} hash={actions.hash} />
    </PageShell>
  );
}
