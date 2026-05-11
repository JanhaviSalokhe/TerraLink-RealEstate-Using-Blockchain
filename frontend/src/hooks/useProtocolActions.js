import { parseUnits } from 'viem';
import { useWriteContract } from 'wagmi';
import { contracts, erc20Abi, fractionalInvestmentAbi, marketplaceAbi, propertyNftAbi, rentalEscrowAbi } from '../lib/contracts';

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

  async function setPropertyOperatorApproval(operator, approved = true) {
    return writeContractAsync({
      address: contracts.propertyNFT,
      abi: propertyNftAbi,
      functionName: 'setApprovalForAll',
      args: [operator, approved],
    });
  }

  async function approveMarketplaceOperator() {
    return setPropertyOperatorApproval(contracts.marketplace, true);
  }

  async function approveRentalOperator() {
    return setPropertyOperatorApproval(contracts.rentalEscrow, true);
  }

  async function approveFractionalOperator() {
    return setPropertyOperatorApproval(contracts.fractionalInvestment, true);
  }

  async function listProperty(tokenId, priceUsd) {
    return writeContractAsync({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'listProperty',
      args: [BigInt(tokenId), parseUnits(String(priceUsd), 6)],
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

  async function enableFractionalInvestment(propertyId, targetAmountUsd) {
    return writeContractAsync({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'enableFractionalInvestment',
      args: [BigInt(propertyId), parseUnits(String(targetAmountUsd), 6)],
    });
  }

  async function createRentalAgreement(propertyId, tenant, rentUsd, securityDepositUsd, durationDays) {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    return writeContractAsync({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'createRentalAgreement',
      args: [
        BigInt(propertyId),
        tenant || zeroAddress,
        parseUnits(String(rentUsd), 6),
        parseUnits(String(securityDepositUsd), 6),
        BigInt(Number(durationDays) * 24 * 60 * 60),
      ],
    });
  }

  async function payRent(propertyId) {
    return writeContractAsync({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'payRent',
      args: [BigInt(propertyId)],
    });
  }

  async function claimFractionalPayout(propertyId) {
    return writeContractAsync({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'distributeRentalIncome',
      args: [BigInt(propertyId)],
    });
  }

  return {
    approveMarketplace,
    approveFractional,
    approveRental,
    approveMarketplaceOperator,
    approveRentalOperator,
    approveFractionalOperator,
    listProperty,
    buyProperty,
    acceptRentalAgreement,
    investInProperty,
    enableFractionalInvestment,
    createRentalAgreement,
    payRent,
    claimFractionalPayout,
    hash,
    isPending,
    error,
  };
}
