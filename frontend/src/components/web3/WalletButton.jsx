import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronDown, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button onClick={openConnectModal}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button onClick={openChainModal} className="hidden rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:flex">
              {chain.unsupported ? <Badge variant="violet">Wrong network</Badge> : <Badge variant={chain.id === 11155111 ? 'emerald' : 'blue'}>{chain.name}</Badge>}
            </button>
            <Button variant="secondary" onClick={openAccountModal}>
              <Wallet className="h-4 w-4" />
              {account.displayName}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
