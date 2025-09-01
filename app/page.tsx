'use client';

import dynamic from 'next/dynamic';

const WellSwapGlobalPlatform = dynamic(() => import('../components/WellSwapComplete'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

export default function Home() {
  return <WellSwapGlobalPlatform />;
}