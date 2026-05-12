import { parseUnits } from 'viem';
import { useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { contracts, erc20Abi, fractionalInvestmentAbi, marketplaceAbi, propertyNftAbi, rentalEscrowAbi, SEPOLIA_CHAIN_ID } from '../lib/contracts';

export function useProtocolActions() {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: SEPOLIA_CHAIN_ID });
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

  function assertSepolia() {
    if (chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error('Please switch to Sepolia before using TerraLink contracts.');
    }
    if (!publicClient) {
      throw new Error('Sepolia RPC client is not ready. Check your wallet/network connection.');
    }
  }

  async function writeAndWait(request) {
    assertSepolia();
    const txHash = await writeContractAsync({ chainId: SEPOLIA_CHAIN_ID, ...request });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    return txHash;
  }

  async function approveMarketplace(amountUsd) {
    return writeAndWait({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.marketplace, parseUnits(String(amountUsd), 6)],
    });
  }

  async function approveFractional(amountUsd) {
    return writeAndWait({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.fractionalInvestment, parseUnits(String(amountUsd), 6)],
    });
  }

  async function approveRental(amountUsd) {
    return writeAndWait({
      address: contracts.mockUSDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contracts.rentalEscrow, parseUnits(String(amountUsd), 6)],
    });
  }

  async function buyProperty(tokenId) {
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'buyProperty',
      args: [BigInt(tokenId)],
    });
  }

  async function setPropertyOperatorApproval(operator, approved = true) {
    return writeAndWait({
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
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'listProperty',
      args: [BigInt(tokenId), parseUnits(String(priceUsd), 6)],
    });
  }

  async function cancelListing(tokenId) {
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'cancelListing',
      args: [BigInt(tokenId)],
    });
  }

  async function updateListingPrice(tokenId, newPriceUsd) {
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'updateListingPrice',
      args: [BigInt(tokenId), parseUnits(String(newPriceUsd), 6)],
    });
  }

  async function acceptRentalAgreement(propertyId) {
    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'acceptRentalAgreement',
      args: [BigInt(propertyId)],
    });
  }

  async function investInProperty(propertyId, amountUsd) {
    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'investInProperty',
      args: [BigInt(propertyId), parseUnits(String(amountUsd), 6)],
    });
  }

  async function enableFractionalInvestment(propertyId, targetAmountUsd) {
    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'enableFractionalInvestment',
      args: [BigInt(propertyId), parseUnits(String(targetAmountUsd), 6)],
    });
  }

  async function createRentalAgreement(propertyId, tenant, rentUsd, securityDepositUsd, durationDays) {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    return writeAndWait({
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
    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'payRent',
      args: [BigInt(propertyId)],
    });
  }

  async function deductFromDeposit(propertyId) {
    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'deductFromDeposit',
      args: [BigInt(propertyId)],
    });
  }

  async function terminateRental(propertyId) {
    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'terminateRental',
      args: [BigInt(propertyId)],
    });
  }

  async function refundDeposit(propertyId) {
    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'refundDeposit',
      args: [BigInt(propertyId)],
    });
  }

  async function depositFractionalRentalIncome(propertyId, amountUsd) {
    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'depositRentalIncome',
      args: [BigInt(propertyId), parseUnits(String(amountUsd), 6)],
    });
  }

  async function claimFractionalPayout(propertyId) {
    return writeAndWait({
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
    cancelListing,
    updateListingPrice,
    buyProperty,
    acceptRentalAgreement,
    investInProperty,
    enableFractionalInvestment,
    createRentalAgreement,
    payRent,
    deductFromDeposit,
    terminateRental,
    refundDeposit,
    depositFractionalRentalIncome,
    claimFractionalPayout,
    hash,
    isPending,
    error,
  };
}
