'use client';

import Image from 'next/image';

interface HeaderProps {
  onRefresh?: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <Image 
                src="/surgepay-logo.png" 
                alt="SurgePay" 
                width={120} 
                height={40}
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-white/90 mt-1">
                Real-time transaction insights and wallet monitoring
              </p>
            </div>
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-md flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Data
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
