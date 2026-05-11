import { ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';

const states = {
  idle: { icon: Loader2, title: 'Preparing transaction', progress: 15 },
  uploading: { icon: Loader2, title: 'Uploading to IPFS', progress: 35 },
  pending: { icon: Loader2, title: 'Waiting for wallet signature', progress: 58 },
  confirming: { icon: Loader2, title: 'Confirming on Sepolia', progress: 78 },
  success: { icon: CheckCircle2, title: 'Transaction complete', progress: 100 },
  error: { icon: XCircle, title: 'Transaction failed', progress: 100 },
};

export function TransactionModal({ open, onClose, status = 'idle', hash }) {
  const state = states[status] || states.idle;
  const Icon = state.icon;
  const spinning = ['idle', 'uploading', 'pending', 'confirming'].includes(status);

  return (
    <Modal open={open} onClose={onClose} title="Blockchain Transaction">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-200">
            <Icon className={`h-7 w-7 ${spinning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="font-bold text-white">{state.title}</p>
            <p className="text-sm text-slate-400">Every step is tracked from IPFS metadata to final contract call.</p>
          </div>
        </div>
        <Progress value={state.progress} />
        <div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
          {['Upload', 'Sign', 'Mine', 'Done'].map((label, index) => (
            <div key={label} className={index * 25 < state.progress ? 'text-emerald-200' : ''}>{label}</div>
          ))}
        </div>
        {hash && (
          <Button asChild variant="outline" className="w-full">
            <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">
              View on Etherscan
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </Modal>
  );
}
