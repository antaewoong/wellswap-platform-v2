✅ 완벽합니다! 귀하의 지갑 주소로 설정하겠습니다.
🔧 업데이트된 lib/supabase.ts 파일:
기존 내용 유지하고 아래 내용 추가:
typescript// 기존 내용 유지
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

// 아래 내용 추가
export const supabase = createClient()

// 관리자 지갑 주소 목록 - 귀하의 실제 지갑 주소
export const ADMIN_WALLETS = [
  '0x02756b93394d0bD27aE81C1E5a6e1d55D0B608FE', // 안태웅님 관리자 지갑
  // 추가 관리자 지갑 주소들 (필요시 여기에 추가)
]

// 사용자 권한 확인
export const checkUserRole = (walletAddress: string): 'admin' | 'user' => {
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase()) ? 'admin' : 'user'
}

// 데이터베이스 타입 정의
export interface InsurancePolicy {
  id: string
  user_id: string
  wallet_address: string
  company: string
  product_name: string
  policy_amount: number
  start_date: string
  payment_term: number
  payment_amount: number
  payment_period: string
  status: 'pending' | 'listed' | 'sold'
  ocr_data: any
  created_at: string
}

export interface User {
  id: string
  wallet_address: string
  email?: string
  full_name?: string
  role: 'admin' | 'user'
  created_at: string
}