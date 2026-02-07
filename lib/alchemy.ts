import { Network, Alchemy } from 'alchemy-sdk';

if (!process.env.ALCHEMY_TOKEN) {
  throw new Error('Missing env.ALCHEMY_TOKEN');
}

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

const network = networkMap[process.env.ALCHEMY_NETWORK || 'base-mainnet'] || Network.BASE_MAINNET;

const config = {
  apiKey: process.env.ALCHEMY_TOKEN,
  network,
};

export const alchemy = new Alchemy(config);

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
