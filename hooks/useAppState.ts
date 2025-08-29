import { useState, useMemo } from 'react';

// 관리자 지갑 주소 목록
const ADMIN_WALLETS = [
  '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0',
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
  '0x9b1a5f8709c6710650a010b4c9c16b1f9a5f8709',
  '0x1a2b3c4d5e6f7890123456789012345678901234',
  '0x5a6b7c8d9e0f1234567890123456789012345678',
  '0x9c8b7a6f5e4d3c2b1a098765432109876543210'
];

export const useAppState = () => {
  // 페이지 상태
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState("en");
  
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Web3 상태 (외부에서 주입)
  const [web3Account, setWeb3Account] = useState<string | null>(null);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);

  // 관리자 권한 확인
  const isAdmin = useMemo(() => {
    const currentAccount = connectedAccount || web3Account;
    if (!currentAccount) return false;
    return ADMIN_WALLETS.includes(currentAccount.toLowerCase());
  }, [connectedAccount, web3Account]);

  // 관리자 메뉴 표시 여부
  const showAdminMenu = useMemo(() => {
    return isAdmin && isAuthenticated && isWeb3Connected;
  }, [isAdmin, isAuthenticated, isWeb3Connected]);

  // 페이지 변경 함수
  const changePage = (page: string) => {
    setCurrentPage(page);
  };

  return {
    // 상태
    currentPage,
    currentLanguage,
    isAuthenticated,
    connectedAccount,
    user,
    isLoading,
    web3Account,
    isWeb3Connected,
    isAdmin,
    showAdminMenu,
    
    // 액션
    setCurrentPage,
    setCurrentLanguage,
    setIsAuthenticated,
    setConnectedAccount,
    setUser,
    setIsLoading,
    setWeb3Account,
    setIsWeb3Connected,
    changePage,
    
    // 상수
    ADMIN_WALLETS
  };
};
