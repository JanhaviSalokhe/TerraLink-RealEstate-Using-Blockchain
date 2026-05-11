import { parseUnits } from 'viem';
import { useWriteContract } from 'wagmi';
import { contracts, erc20Abi, fractionalInvestmentAbi, marketplaceAbi, rentalEscrowAbi } from '../lib/contracts';

export function useProtocolActions() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  async function approveMarketplace(amountUsd) {
    return writeContractAsync({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.marketplace, parseUnits(String(amountUsd), 6)],
    });
  }

  async function approveFractional(amountUsd) {
    return writeContractAsync({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.fractionalInvestment, parseUnits(String(amountUsd), 6)],
    });
  }

  async function approveRental(amountUsd) {
    return writeContractAsync({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.rentalEscrow, parseUnits(String(amountUsd), 6)],
    });
  }

  async function buyProperty(tokenId) {
    return writeContractAsync({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'buyProperty',
      args: [BigInt(tokenId)],
    });
  }

  async function acceptRentalAgreement(propertyId) {
    return writeContractAsync({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'acceptRentalAgreement',
      args: [BigInt(propertyId)],
    });
  }

  async function investInProperty(propertyId, amountUsd) {
    return writeContractAsync({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'investInProperty',
      args: [BigInt(propertyId), parseUnits(String(amountUsd), 6)],
    });
  }

  return {
    approveMarketplace,
    approveFractional,
    approveRental,
    buyProperty,
    acceptRentalAgreement,
    investInProperty,
    hash,
    isPending,
    error,
  };
}
