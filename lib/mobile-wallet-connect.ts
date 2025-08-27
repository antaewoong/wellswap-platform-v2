'use client';

import { ethers } from 'ethers';

// 모바일 환경 감지
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 모바일에서 MetaMask 연결
export const connectMobileWallet = async () => {
  try {
    console.log('📱 모바일 지갑 연결 시작...');
    
    // 모바일 환경 확인
    if (!isMobile()) {
      throw new Error('데스크톱 환경에서는 일반 연결을 사용하세요');
    }

    // MetaMask 설치 확인
    if (typeof window.ethereum === 'undefined') {
      const metamaskUrl = 'https://metamask.io/download/';
      window.open(metamaskUrl, '_blank');
      throw new Error('MetaMask 앱을 설치해주세요. 다운로드 페이지가 열립니다.');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 모바일에서 더 안정적인 연결 방식
    let accounts;
    try {
      // 먼저 기존 연결 확인
      accounts = await provider.send('eth_accounts', []);
      if (!accounts || accounts.length === 0) {
        console.log('📱 새 연결 요청...');
        accounts = await provider.send('eth_requestAccounts', []);
      }
    } catch (error) {
      console.log('📱 연결 재시도...');
      // 모바일에서 재시도
      await new Promise(resolve => setTimeout(resolve, 1000));
      accounts = await provider.send('eth_requestAccounts', []);
    }

    const signer = provider.getSigner();
    
    // BSC Testnet 설정
    const network = await provider.getNetwork();
    if (network.chainId !== 97) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BSC Testnet',
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com/'],
              nativeCurrency: {
                name: 'tBNB',
                symbol: 'tBNB',
                decimals: 18
              }
            }],
          });
        } else {
          console.warn('📱 네트워크 전환 실패, 수동으로 BSC Testnet으로 전환해주세요');
        }
      }
    }

    console.log('✅ 모바일 지갑 연결 완료:', accounts[0]);
    return {
      provider,
      signer,
      account: accounts[0],
      isConnected: true
    };
  } catch (error) {
    console.error('❌ 모바일 지갑 연결 실패:', error);
    throw error;
  }
};
