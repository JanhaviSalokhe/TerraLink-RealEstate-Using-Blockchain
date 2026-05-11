import { useChainId } from 'wagmi';
import { Badge } from '../ui/badge';

export function ChainBadge() {
  const chainId = useChainId();
  const isSepolia = chainId === 11155111;
  return <Badge variant={isSepolia ? 'emerald' : 'violet'}>{isSepolia ? 'Sepolia Ready' : 'Switch to Sepolia'}</Badge>;
}
