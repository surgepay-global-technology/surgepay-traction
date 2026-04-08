import { Network, Alchemy } from 'alchemy-sdk';

const networkMap: Record<string, Network> = {
  'eth-mainnet': Network.ETH_MAINNET,
  'eth-sepolia': Network.ETH_SEPOLIA,
  'base-mainnet': Network.BASE_MAINNET,
  'base-sepolia': Network.BASE_SEPOLIA,
  'polygon-mainnet': Network.MATIC_MAINNET,
  'polygon-mumbai': Network.MATIC_MUMBAI,
  'arbitrum-mainnet': Network.ARB_MAINNET,
  'optimism-mainnet': Network.OPT_MAINNET,
};

let alchemyClient: Alchemy | null | undefined;

/** Returns an Alchemy client when ALCHEMY_TOKEN is set; otherwise null. Never throws at import time. */
export function getAlchemy(): Alchemy | null {
  if (alchemyClient !== undefined) {
    return alchemyClient;
  }
  const apiKey = process.env.ALCHEMY_TOKEN;
  if (!apiKey) {
    alchemyClient = null;
    return null;
  }
  const network = networkMap[process.env.ALCHEMY_NETWORK || 'base-mainnet'] || Network.BASE_MAINNET;
  alchemyClient = new Alchemy({ apiKey, network });
  return alchemyClient;
}

export interface WalletInfo {
  address: string;
  ethBalance: string;
  tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  }>;
  transactionCount: number;
}
