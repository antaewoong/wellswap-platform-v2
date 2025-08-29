'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Ctx = {
  account: string | null;
  chainId: string | null;
  provider: any | null;
  connect: () => Promise<string>;
  connectWallet: () => Promise<string>;
  isConnected: boolean;
  networkError: string | null;
  signer: any | null;
  contract: any | null;
  usdToBnb: () => number;
};

const Web3Ctx = createContext<Ctx>(null as any);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string|null>(null);
  const [chainId, setChainId] = useState<string|null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState<string|null>(null);
  const providerRef = useRef<any>(null);
  const listenersSet = useRef(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    
    providerRef.current = (eth.providers?.find((p:any)=>p.isMetaMask) ?? eth);
    
    // 복구: 새로고침/리마운트 시 계정/체인 읽기
    (async () => {
      try {
        const [cid, accts] = await Promise.all([
          providerRef.current.request({ method: 'eth_chainId' }).catch(()=>null),
          providerRef.current.request({ method: 'eth_accounts' }).catch(()=>[])
        ]);
        if (cid) setChainId(cid);
        if (accts?.[0]) {
          setAccount(accts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('초기 계정/체인 읽기 실패:', error);
      }
    })();

    // 이벤트는 1회만
    if (!listenersSet.current) {
      const handleAccountsChanged = (accounts: string[]) => {
        const newAccount = accounts?.[0] ?? null;
        setAccount(newAccount);
        setIsConnected(!!newAccount);
        setNetworkError(null);
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
        setNetworkError(null);
      };

      providerRef.current.on('accountsChanged', handleAccountsChanged);
      providerRef.current.on('chainChanged', handleChainChanged);
      listenersSet.current = true;

      return () => {
        if (providerRef.current && listenersSet.current) {
          providerRef.current.removeListener('accountsChanged', handleAccountsChanged);
          providerRef.current.removeListener('chainChanged', handleChainChanged);
          listenersSet.current = false;
        }
      };
    }
  }, []);

  const connect = async () => {
    try {
      const eth = providerRef.current ?? (window as any).ethereum;
      if (!eth) throw new Error('MetaMask가 설치되지 않았습니다.');

      console.log('MetaMask 연결 시작...');
      
      // 필요 체인으로 스위치(예: BSC testnet 0x61)
      const target = '0x61';
      const cur = await eth.request({ method: 'eth_chainId' });
      if (cur !== target) {
        try { 
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] }); 
        } catch (switchError: any) {
          console.warn('체인 스위치 실패:', switchError.message);
        }
      }
      
      // 사용자 제스처 안에서 호출될 것 (버튼 onClick 등)
      const accts = await eth.request({ method: 'eth_requestAccounts' });
      if (!accts?.[0]) throw new Error('MetaMask에서 계정을 선택하지 않았습니다.');
      
      setAccount(accts[0]);  // ✅ 컨텍스트에 즉시 반영
      setIsConnected(true);
      setNetworkError(null);
      
      console.log('지갑 연결 성공:', accts[0]);
      return accts[0];
    } catch (error: any) {
      console.error('지갑 연결 실패:', error);
      setNetworkError(error.message);
      setIsConnected(false);
      setAccount(null);
      throw error;
    }
  };

  return (
    <Web3Ctx.Provider value={{ 
      account, 
      chainId, 
      provider: providerRef.current, 
      connect,
      connectWallet: connect, // 별칭 추가
      isConnected,
      networkError,
      signer: null, // 임시로 null
      contract: null, // 임시로 null
      usdToBnb: () => 0 // 임시 함수
    }}>
      {children}
    </Web3Ctx.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Ctx);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
