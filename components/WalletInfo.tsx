'use client';

import { useState } from 'react';
import { shortenAddress, parseEther, safeFetch } from '@/lib/utils';

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
}

interface WalletData {
  address: string;
  ethBalance: string;
  tokenBalances: TokenBalance[];
  transactionCount: number;
}

export default function WalletInfo() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletInfo = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await safeFetch(`/api/wallets/info?address=${walletAddress}`);

      if (result.error?.includes('missing response') || result.error?.includes('SERVER_ERROR')) {
        throw new Error('Invalid Alchemy API key. Please add a valid Alchemy API key to your .env file (ALCHEMY_TOKEN). The current token is not a valid API key.');
      }

      setWalletData(result.data);
    } catch (err: any) {
      setError(err.message);
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wallet Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={fetchWalletInfo}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Check Wallet'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ Alchemy Configuration Issue</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            <strong>To fix:</strong> Get your API key from <a href="https://dashboard.alchemy.com" target="_blank" rel="noopener noreferrer" className="underline">dashboard.alchemy.com</a> → Your App → "VIEW KEY" → Copy the API KEY (not auth token)
          </p>
        </div>
      )}

      {walletData && (
        <div className="space-y-6">
          {/* Wallet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-xl border border-primary/20">
              <p className="text-sm text-primary-dark dark:text-primary font-semibold mb-1">Address</p>
              <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                {shortenAddress(walletData.address)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-5 rounded-xl border border-secondary/20">
              <p className="text-sm text-secondary-dark font-semibold mb-1">ETH Balance</p>
              <p className="text-lg font-bold text-secondary-dark">
                {walletData.ethBalance} ETH
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-xl border border-primary/20">
              <p className="text-sm text-primary-dark dark:text-primary font-semibold mb-1">Transactions</p>
              <p className="text-lg font-bold text-primary-dark dark:text-primary">
                {walletData.transactionCount}
              </p>
            </div>
          </div>

          {/* Token Balances */}
          {walletData.tokenBalances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Token Balances
              </h3>
              <div className="table-container">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contract
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {walletData.tokenBalances.map((token, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {token.symbol || 'UNKNOWN'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {token.name || 'Unknown Token'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {parseEther(token.tokenBalance, token.decimals)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                          {shortenAddress(token.contractAddress)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
