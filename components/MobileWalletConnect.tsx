'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Smartphone, Download, ExternalLink } from 'lucide-react';
import { MobileGlassButton } from './ui/MobileOptimized';

interface MobileWalletConnectProps {
  onConnect: (publicKey: string, balance: number) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  isConnected: boolean;
  connectedAddress?: string;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  downloadUrl: string;
  deepLink?: string;
  supported: boolean;
}

const MobileWalletConnect: React.FC<MobileWalletConnectProps> = ({
  onConnect,
  onDisconnect,
  onError,
  isConnected,
  connectedAddress
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile || window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Available wallet options for mobile (Polygon/Ethereum compatible)  
  const walletOptions: WalletOption[] = [
    {
      id: 'metamask_mobile',
      name: 'MetaMask',
      icon: '🦊',
      downloadUrl: 'https://metamask.io/download/',
      deepLink: 'metamask://dapp/wellswap.app',
      supported: true
    },
    {
      id: 'trust_wallet',
      name: 'Trust Wallet', 
      icon: '🛡️',
      downloadUrl: 'https://trustwallet.com/',
      deepLink: 'trust://browser_enable',
      supported: true
    }
  ];

  // Check if wallet is installed
  const isWalletInstalled = (walletId: string): boolean => {
    if (typeof window === 'undefined') return false;

    switch (walletId) {
      case 'metamask_mobile':
        return !!(window as any).ethereum?.isMetaMask;
      case 'trust_wallet':
        return !!(window as any).ethereum?.isTrust || !!(window as any).trustWallet;
      default:
        return false;
    }
  };

  // Connect to specific wallet
  const connectWallet = async (walletId: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletId);

    try {
      switch (walletId) {
        case 'metamask_mobile':
          await connectMetaMaskMobile();
          break;
        case 'trust_wallet':
          await connectTrustWallet();
          break;
        default:
          throw new Error('Wallet not supported');
      }
    } catch (error) {
      console.error(`Failed to connect ${walletId}:`, error);
      onError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  // MetaMask Mobile connection
  const connectMetaMaskMobile = async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      // iPhone에서는 Deep Link를 더 안전하게 처리
      if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS Safari에서는 Universal Link 사용
        const currentUrl = window.location.href;
        const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}`;
        
        // 새 탭으로 MetaMask 앱 열기
        window.open(metamaskUrl, '_blank');
        
        throw new Error('MetaMask 앱으로 이동합니다. 연결 후 다시 돌아와주세요.');
      } else {
        // Android나 다른 플랫폼
        window.location.href = 'metamask://dapp/wellswap.app';
        throw new Error('MetaMask app not detected. Opening MetaMask app...');
      }
    }

    // Switch to Polygon network if needed
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon Mainnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon',
            rpcUrls: ['https://polygon-rpc.com/'],
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            blockExplorerUrls: ['https://polygonscan.com/'],
          }],
        });
      }
    }

    // Request account access
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length > 0) {
      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      onConnect(accounts[0], parseInt(balance, 16) / 1e18);
    }
  };

  // Trust Wallet connection
  const connectTrustWallet = async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum || (!ethereum.isTrust && !(window as any).trustWallet)) {
      // Try to open Trust Wallet app
      window.location.href = 'trust://browser_enable';
      throw new Error('Trust Wallet app not detected. Opening Trust Wallet...');
    }

    // Request account access
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length > 0) {
      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      onConnect(accounts[0], parseInt(balance, 16) / 1e18);
    }
  };

  // Open wallet download page
  const downloadWallet = (walletId: string) => {
    const wallet = walletOptions.find(w => w.id === walletId);
    if (wallet) {
      window.open(wallet.downloadUrl, '_blank');
    }
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  if (isConnected && connectedAddress) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mobile-glass-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">Wallet Connected</h3>
            <p className="text-sm text-neutral-600">Mobile optimized</p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-neutral-500 mb-1">Connected Address</p>
          <p className="font-mono text-sm text-neutral-800 break-all">
            {`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`}
          </p>
        </div>

        <MobileGlassButton
          variant="secondary"
          fullWidth
          onClick={onDisconnect}
          className="text-neutral-700"
        >
          Disconnect Wallet
        </MobileGlassButton>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mobile-glass-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-neutral-900">Connect Mobile Wallet</h3>
          <p className="text-sm text-neutral-600">Choose your preferred wallet</p>
        </div>
      </div>

      <div className="space-y-3">
        {walletOptions.map((wallet) => {
          const installed = isWalletInstalled(wallet.id);
          const connecting = isConnecting && selectedWallet === wallet.id;

          return (
            <motion.div
              key={wallet.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="font-medium text-neutral-900">{wallet.name}</p>
                  <p className="text-xs text-neutral-600">
                    {installed ? 'Installed' : 'Not installed'}
                  </p>
                </div>
              </div>

              {installed ? (
                <MobileGlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => connectWallet(wallet.id)}
                  disabled={connecting}
                >
                  {connecting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    'Connect'
                  )}
                </MobileGlassButton>
              ) : (
                <button
                  onClick={() => downloadWallet(wallet.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5">
            ⚠️
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Mobile Wallet Tips</p>
            <ul className="text-xs text-amber-700 mt-1 space-y-1">
              <li>• Make sure your wallet app is updated</li>
              <li>• Enable DApp browser in wallet settings</li>
              <li>• Switch to Polygon network if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletConnect;