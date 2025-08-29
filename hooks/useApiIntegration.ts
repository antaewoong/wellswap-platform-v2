import { useState, useCallback } from 'react';

export const useApiIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 생성/업데이트 API
  const createOrUpdateUser = useCallback(async (walletAddress: string, userData?: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          ...userData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 요청 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('사용자 API 오류:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 사용자 조회 API
  const getUser = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?wallet_address=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`사용자 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 보험 자산 API
  const getInsuranceAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/insurance');
      
      if (!response.ok) {
        throw new Error(`보험 자산 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('보험 자산 조회 오류:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 보험 자산 업데이트 API
  const updateInsuranceAsset = useCallback(async (assetData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/insurance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData)
      });

      if (!response.ok) {
        throw new Error(`보험 자산 업데이트 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('보험 자산 업데이트 오류:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    createOrUpdateUser,
    getUser,
    getInsuranceAssets,
    updateInsuranceAsset
  };
};
