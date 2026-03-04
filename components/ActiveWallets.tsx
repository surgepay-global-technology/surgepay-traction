'use client';

import { useState } from 'react';
import { shortenAddress, safeFetch } from '@/lib/utils';

interface WalletData {
  address: string;
  balance: string;
  transactionCount: number;
  isActive: boolean;
  error?: string;
}

export default function ActiveWallets() {
  const [addresses, setAddresses] = useState('');
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalActive, setTotalActive] = useState(0);

  const checkWallets = async () => {
    if (!addresses.trim()) {
      setError('Please enter at least one wallet address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await safeFetch(`/api/wallets/active?addresses=${encodeURIComponent(addresses)}`);

      if (result.error?.includes('missing response') || result.error?.includes('SERVER_ERROR')) {
        throw new Error('Invalid Alchemy API key. Please add a valid Alchemy API key to your .env file (ALCHEMY_TOKEN). The current token is not a valid API key.');
      }

      setWallets(result.data.wallets || []);
      setTotalActive(result.data.active || 0);
    } catch (err: any) {
      setError(err.message);
      setWallets([]);
      setTotalActive(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Check Active Wallets
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wallet Addresses (comma-separated)
        </label>
        <textarea
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          placeholder="0x123..., 0x456..., 0x789..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter one or more Ethereum addresses separated by commas
        </p>
      </div>

            <button
              onClick={checkWallets}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking Wallets...' : 'Check Wallets'}
            </button>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ Alchemy Configuration Issue</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            <strong>To fix:</strong> Get your API key from <a href="https://dashboard.alchemy.com" target="_blank" rel="noopener noreferrer" className="underline">dashboard.alchemy.com</a> → Your App → "VIEW KEY" → Copy the API KEY (not auth token)
          </p>
        </div>
      )}

      {wallets.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm">
              <p className="text-sm text-primary-dark dark:text-primary font-semibold mb-1">Total Wallets</p>
              <p className="text-3xl font-bold text-primary-dark dark:text-primary">{wallets.length}</p>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-5 rounded-xl border border-secondary/20 shadow-sm">
              <p className="text-sm text-secondary-dark font-semibold mb-1">Active Wallets</p>
              <p className="text-3xl font-bold text-secondary-dark">{totalActive}</p>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {wallets.map((wallet, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {shortenAddress(wallet.address, 6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {wallet.error ? '-' : `${wallet.balance} ETH`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {wallet.error ? '-' : wallet.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {wallet.error ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          Error
                        </span>
                      ) : wallet.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
