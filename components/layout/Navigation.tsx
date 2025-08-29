import React from 'react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  showAdminMenu: boolean;
  t: any;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setCurrentPage,
  showAdminMenu,
  t
}) => {
  return (
    <div className="hidden md:flex space-x-6">
      <button
        onClick={() => setCurrentPage('sell')}
        className={`font-light transition-colors ${currentPage === 'sell' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
      >
        {t.sell}
      </button>
      <button
        onClick={() => setCurrentPage('buy')}
        className={`font-light transition-colors ${currentPage === 'buy' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
      >
        {t.buy}
      </button>
      <button
        onClick={() => setCurrentPage('inquiry')}
        className={`font-light transition-colors ${currentPage === 'inquiry' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
      >
        {t.inquiry}
      </button>
      {showAdminMenu && (
        <button
          onClick={() => setCurrentPage('admin')}
          className={`font-light transition-colors ${currentPage === 'admin' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
        >
          Admin Panel
        </button>
      )}
    </div>
  );
};
