import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value, compact = false) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(numeric);
}

export function shortAddress(address = '') {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export function formatTokenAmount(value = 0n, decimals = 6) {
  const numberValue = Number(value) / 10 ** decimals;
  return Number.isFinite(numberValue) ? numberValue : 0;
}
