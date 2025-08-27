// lib/auth.ts - Complete Authentication Service
import { supabase, checkUserRole, log, WellSwapError } from './supabase'
import type { User } from '@supabase/supabase-js'
import { Database } from './database.types'

export interface AuthUser extends User {
  profile?: Database['public']['Tables']['profiles']['Row']
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  phone?: string
  country?: string
  language?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  // 회원가입
  static async signUp(signUpData: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.full_name,
            phone: signUpData.phone,
            country: signUpData.country || 'Hong Kong',
            language: signUpData.language || 'en'
          }
        }
      })

      if (error) {
        log.error('Sign up error:', error)
        throw new WellSwapError(error.message, 'SIGNUP_ERROR', error)
      }

      log.info('User signed up successfully:', data.user?.email)
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Sign up failed', 'SIGNUP_FAILED', error)
    }
  }

  // 로그인
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        log.error('Sign in error:', error)
        throw new WellSwapError(error.message, 'SIGNIN_ERROR', error)
      }

      log.info('User signed in successfully:', data.user?.email)
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Sign in failed', 'SIGNIN_FAILED', error)
    }
  }

  // 로그아웃
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        log.error('Sign out error:', error)
        throw new WellSwapError(error.message, 'SIGNOUT_ERROR', error)
      }

      log.info('User signed out successfully')
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Sign out failed', 'SIGNOUT_FAILED', error)
    }
  }

  // 현재 사용자 정보 가져오기 (프로필 포함)
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        log.error('Get user error:', error)
        return null
      }

      if (!user) return null

      // 사용자 프로필 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        log.error('Get profile error:', profileError)
      }

      return {
        ...user,
        profile: profile || undefined
      }
    } catch (error) {
      log.error('Get current user failed:', error)
      return null
    }
  }

  // 프로필 업데이트
  static async updateProfile(updates: Database['public']['Tables']['profiles']['Update']) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('No authenticated user', 'AUTH_REQUIRED')

      const { data, error } = await (supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single() as any)

      if (error) {
        log.error('Update profile error:', error)
        throw new WellSwapError(error.message, 'PROFILE_UPDATE_ERROR', error)
      }

      log.info('Profile updated successfully')
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Profile update failed', 'PROFILE_UPDATE_FAILED', error)
    }
  }

  // 지갑 주소 연결
  static async connectWallet(walletAddress: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('No authenticated user', 'AUTH_REQUIRED')

      // 지갑 주소 중복 확인
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress.toLowerCase())
        .neq('id', user.id)
        .single()

      if (existingProfile) {
        throw new WellSwapError('Wallet address already connected to another account', 'WALLET_ALREADY_CONNECTED')
      }

      // 사용자 권한 확인
      const role = checkUserRole(walletAddress)

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          wallet_address: walletAddress.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        log.error('Connect wallet error:', error)
        throw new WellSwapError(error.message, 'WALLET_CONNECT_ERROR', error)
      }

      log.info('Wallet connected successfully:', { walletAddress, role })
      return { ...data, role }
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Wallet connection failed', 'WALLET_CONNECT_FAILED', error)
    }
  }

  // 지갑 주소로 사용자 찾기
  static async getUserByWallet(walletAddress: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        log.error('Get user by wallet error:', error)
        throw new WellSwapError(error.message, 'USER_LOOKUP_ERROR', error)
      }

      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('User lookup failed', 'USER_LOOKUP_FAILED', error)
    }
  }

  // 비밀번호 재설정 요청
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        log.error('Reset password error:', error)
        throw new WellSwapError(error.message, 'RESET_PASSWORD_ERROR', error)
      }

      log.info('Password reset email sent')
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Password reset failed', 'RESET_PASSWORD_FAILED', error)
    }
  }

  // 비밀번호 업데이트
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        log.error('Update password error:', error)
        throw new WellSwapError(error.message, 'UPDATE_PASSWORD_ERROR', error)
      }

      log.info('Password updated successfully')
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Password update failed', 'UPDATE_PASSWORD_FAILED', error)
    }
  }

  // 이메일 확인
  static async verifyEmail(token: string, email: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
        email: email
      })

      if (error) {
        log.error('Verify email error:', error)
        throw new WellSwapError(error.message, 'EMAIL_VERIFY_ERROR', error)
      }

      log.info('Email verified successfully')
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Email verification failed', 'EMAIL_VERIFY_FAILED', error)
    }
  }

  // 인증 상태 변경 리스너
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      log.info('Auth state changed:', event)
      callback(event, session)
    })
  }

  // 사용자 권한 확인
  static async getUserRole(userId?: string): Promise<'admin' | 'user'> {
    try {
      let targetUserId = userId

      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 'user'
        targetUserId = user.id
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', targetUserId)
        .single()

      if (!profile?.wallet_address) return 'user'

      return checkUserRole(profile.wallet_address)
    } catch (error) {
      log.error('Get user role failed:', error)
      return 'user'
    }
  }

  // KYC 상태 업데이트 (관리자만)
  static async updateKYCStatus(userId: string, status: 'pending' | 'verified' | 'rejected') {
    try {
      const currentUserRole = await this.getUserRole()
      if (currentUserRole !== 'admin') {
        throw new WellSwapError('Admin access required', 'ADMIN_REQUIRED')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        log.error('Update KYC status error:', error)
        throw new WellSwapError(error.message, 'KYC_UPDATE_ERROR', error)
      }

      log.info('KYC status updated:', { userId, status })
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('KYC status update failed', 'KYC_UPDATE_FAILED', error)
    }
  }

  // 사용자 통계 업데이트
  static async updateUserStats(userId: string, stats: {
    total_trades?: number
    total_volume?: number
    reputation_score?: number
  }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        log.error('Update user stats error:', error)
        throw new WellSwapError(error.message, 'STATS_UPDATE_ERROR', error)
      }

      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('User stats update failed', 'STATS_UPDATE_FAILED', error)
    }
  }
}
