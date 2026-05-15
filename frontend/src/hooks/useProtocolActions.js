import { formatUnits, getAddress, parseUnits } from 'viem';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { contracts, erc20Abi, fractionalInvestmentAbi, marketplaceAbi, propertyNftAbi, rentalEscrowAbi, SEPOLIA_CHAIN_ID } from '../lib/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function parseTokenAmount(amount, decimals) {
  return typeof amount === 'bigint' ? amount : parseUnits(String(amount), decimals);
}

function formatTokenAmount(amount, decimals, symbol = 'tokens') {
  return `${Number(formatUnits(amount, decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals })} ${symbol}`;
}

function sameAddress(left = '', right = '') {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function useProtocolActions() {
  const { address } = useAccount();
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

  async function readPaymentToken(protocolAddress, protocolAbi, protocolName) {
    const paymentToken = await publicClient.readContract({
      address: protocolAddress,
      abi: protocolAbi,
      functionName: 'paymentToken',
    });

    if (!paymentToken || paymentToken === ZERO_ADDRESS) {
      throw new Error(`${protocolName} does not expose a valid payment token.`);
    }

    return getAddress(paymentToken);
  }

  async function getPaymentContext(protocolAddress, protocolAbi, protocolName) {
    assertSepolia();
    const tokenAddress = await readPaymentToken(protocolAddress, protocolAbi, protocolName);
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    return {
      tokenAddress,
      decimals: Number(decimals),
      symbol: tokenAddress.toLowerCase() === contracts.mockUSDT.toLowerCase() ? 'mUSDT' : 'payment tokens',
    };
  }

  async function approvePaymentToken(protocolAddress, protocolAbi, protocolName, amount) {
    assertSepolia();
    if (!address) throw new Error('Connect your wallet before approving payment tokens.');

    const { tokenAddress, decimals } = await getPaymentContext(protocolAddress, protocolAbi, protocolName);
    const rawAmount = parseTokenAmount(amount, decimals);
    if (rawAmount === 0n) throw new Error('Approval amount must be greater than zero.');

    const currentAllowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, protocolAddress],
    });

    if (currentAllowance >= rawAmount) return undefined;

    if (currentAllowance > 0n) {
      await writeAndWait({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [protocolAddress, 0n],
      });
    }

    return writeAndWait({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [protocolAddress, rawAmount],
    });
  }

  async function requirePaymentReady(protocolAddress, protocolAbi, protocolName, amount) {
    assertSepolia();
    if (!address) throw new Error('Connect your wallet before sending this transaction.');

    const { tokenAddress, decimals, symbol } = await getPaymentContext(protocolAddress, protocolAbi, protocolName);
    const rawAmount = parseTokenAmount(amount, decimals);
    const [balance, allowance] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, protocolAddress],
      }),
    ]);

    if (balance < rawAmount) {
      throw new Error(`Not enough ${symbol}. Required ${formatTokenAmount(rawAmount, decimals, symbol)}, wallet has ${formatTokenAmount(balance, decimals, symbol)}.`);
    }
    if (allowance < rawAmount) {
      throw new Error(`${protocolName} allowance is too low. Approve ${formatTokenAmount(rawAmount, decimals, symbol)} first.`);
    }
  }

  async function toProtocolAmount(protocolAddress, protocolAbi, protocolName, amount) {
    const { decimals } = await getPaymentContext(protocolAddress, protocolAbi, protocolName);
    return parseTokenAmount(amount, decimals);
  }

  async function approveMarketplace(amountUsd) {
    return approvePaymentToken(contracts.marketplace, marketplaceAbi, 'Marketplace', amountUsd);
  }

  async function approveFractional(amountUsd) {
    return approvePaymentToken(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', amountUsd);
  }

  async function approveRental(amountUsd) {
    return approvePaymentToken(contracts.rentalEscrow, rentalEscrowAbi, 'RentalEscrow', amountUsd);
  }

  async function buyProperty(tokenId) {
    const listing = await publicClient.readContract({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'getListing',
      args: [BigInt(tokenId)],
    });

    await requirePaymentReady(contracts.marketplace, marketplaceAbi, 'Marketplace', listing.price);

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
    const price = await toProtocolAmount(contracts.marketplace, marketplaceAbi, 'Marketplace', priceUsd);
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'listProperty',
      args: [BigInt(tokenId), price],
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
    const newPrice = await toProtocolAmount(contracts.marketplace, marketplaceAbi, 'Marketplace', newPriceUsd);
    return writeAndWait({
      address: contracts.marketplace,
      abi: marketplaceAbi,
      functionName: 'updateListingPrice',
      args: [BigInt(tokenId), newPrice],
    });
  }

  async function acceptRentalAgreement(propertyId) {
    assertSepolia();
    const agreement = await publicClient.readContract({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'getRentalAgreement',
      args: [BigInt(propertyId)],
    });

    if (!agreement?.owner || agreement.owner === ZERO_ADDRESS) {
      throw new Error('Rental agreement was not found on-chain.');
    }
    if (agreement.active) {
      throw new Error('This rental agreement is already active.');
    }
    if (agreement.tenant !== ZERO_ADDRESS && !sameAddress(agreement.tenant, address)) {
      throw new Error('This rental agreement is reserved for another tenant wallet.');
    }

    await requirePaymentReady(
      contracts.rentalEscrow,
      rentalEscrowAbi,
      'RentalEscrow',
      agreement.rentAmount + agreement.securityDeposit,
    );

    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'acceptRentalAgreement',
      args: [BigInt(propertyId)],
    });
  }

  async function investInProperty(propertyId, amountUsd) {
    const amount = await toProtocolAmount(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', amountUsd);
    await requirePaymentReady(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', amount);

    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'investInProperty',
      args: [BigInt(propertyId), amount],
    });
  }

  async function enableFractionalInvestment(propertyId, targetAmountUsd) {
    const targetAmount = await toProtocolAmount(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', targetAmountUsd);
    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'enableFractionalInvestment',
      args: [BigInt(propertyId), targetAmount],
    });
  }

  async function createRentalAgreement(propertyId, tenant, rentUsd, securityDepositUsd, durationDays) {
    const rentAmount = await toProtocolAmount(contracts.rentalEscrow, rentalEscrowAbi, 'RentalEscrow', rentUsd);
    const securityDeposit = await toProtocolAmount(contracts.rentalEscrow, rentalEscrowAbi, 'RentalEscrow', securityDepositUsd);

    return writeAndWait({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'createRentalAgreement',
      args: [
        BigInt(propertyId),
        tenant || ZERO_ADDRESS,
        rentAmount,
        securityDeposit,
        BigInt(Number(durationDays) * 24 * 60 * 60),
      ],
    });
  }

  async function payRent(propertyId) {
    assertSepolia();
    const agreement = await publicClient.readContract({
      address: contracts.rentalEscrow,
      abi: rentalEscrowAbi,
      functionName: 'getRentalAgreement',
      args: [BigInt(propertyId)],
    });

    if (!sameAddress(agreement?.tenant, address)) {
      throw new Error('Connect the tenant wallet assigned to this rental agreement.');
    }

    await requirePaymentReady(contracts.rentalEscrow, rentalEscrowAbi, 'RentalEscrow', agreement.rentAmount);

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
    const amount = await toProtocolAmount(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', amountUsd);
    await requirePaymentReady(contracts.fractionalInvestment, fractionalInvestmentAbi, 'FractionalInvestment', amount);

    return writeAndWait({
      address: contracts.fractionalInvestment,
      abi: fractionalInvestmentAbi,
      functionName: 'depositRentalIncome',
      args: [BigInt(propertyId), amount],
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
