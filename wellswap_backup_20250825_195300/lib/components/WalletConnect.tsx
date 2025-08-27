'use client'

import { useState, useEffect } from 'react'
import { Wallet, LogOut, Shield, User } from 'lucide-react'
import { supabase, checkUserRole } from '../../lib/database-wellswap'

interface WalletConnectProps {
  onConnect: (address: string, role: 'admin' | 'user') => void
  onDisconnect: () => void
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null)

  // 지갑 연결 상태 확인
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const address = accounts[0]
          const role = checkUserRole(address)
          setConnectedAddress(address)
          setUserRole(role)
          onConnect(address, role)
        }
      } catch (error) {
        console.error('지갑 상태 확인 실패:', error)
      }
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    
    try {
      if (!window.ethereum) {
        alert('MetaMask가 설치되지 않았습니다.\n\n1. Chrome에서 MetaMask 확장프로그램 설치\n2. 페이지 새로고침 후 다시 시도')
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      // 지갑 연결 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        const role = checkUserRole(address)
        
        // Supabase에 사용자 정보 저장/업데이트
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address.toLowerCase())
            .single()

          if (!existingUser) {
            // 새 사용자 생성
            const { error } = await supabase
              .from('users')
              .insert({
                wallet_address: address.toLowerCase(),
                role: role,
                created_at: new Date().toISOString()
              })

            if (error) {
              console.error('사용자 생성 실패:', error)
              // 데이터베이스 오류가 있어도 지갑 연결은 계속 진행
            }
          }
        } catch (dbError) {
          console.warn('데이터베이스 연결 실패, 오프라인 모드로 진행:', dbError)
          // 데이터베이스 오류가 있어도 계속 진행
        }

        setConnectedAddress(address)
        setUserRole(role)
        onConnect(address, role)
        
        // 성공 메시지
        if (role === 'admin') {
          alert('🛡️ 관리자 권한으로 연결되었습니다!')
        } else {
          alert('✅ 사용자 권한으로 연결되었습니다!')
        }
      }
    } catch (error: any) {
      console.error('지갑 연결 실패:', error)
      if (error.code === 4001) {
        alert('지갑 연결이 사용자에 의해 거부되었습니다.')
      } else {
        alert('지갑 연결에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setConnectedAddress(null)
    setUserRole(null)
    onDisconnect()
    alert('지갑 연결이 해제되었습니다.')
  }

  if (connectedAddress) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-lg px-4 py-3 shadow-lg border-2 border-gray-100">
          <div className="flex items-center gap-3">
            {userRole === 'admin' ? (
              <Shield className="w-5 h-5 text-red-500" />
            ) : (
              <User className="w-5 h-5 text-green-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userRole === 'admin' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-bold">
                  {userRole === 'admin' ? '🛡️ 관리자' : '👤 사용자'}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono">
                {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-6)}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          연결 해제
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg font-semibold"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          연결 중...
        </>
      ) : (
        <>
          <Wallet className="w-6 h-6" />
          지갑 연결
        </>
      )}
    </button>
  )
}

