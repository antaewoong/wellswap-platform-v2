-- WellSwap Supabase Setup Script
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 사용자 테이블 생성 (이미 존재하는 경우 건너뛰기)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_admin BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 100,
    total_trades INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기존 테이블들 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS public.wellswaphk_ai_evaluations CASCADE;
DROP TABLE IF EXISTS public.wellswaphk_transactions CASCADE;
DROP TABLE IF EXISTS public.wellswaphk_insurance_policies CASCADE;

-- 3. 보험 정책 테이블 생성
CREATE TABLE public.wellswaphk_insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    insurance_company TEXT NOT NULL,
    policy_details JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ai_evaluated', 'approved', 'rejected', 'sold')),
    ai_valuation DECIMAL(15,2),
    platform_price DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 거래 테이블 생성
CREATE TABLE public.wellswaphk_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.wellswaphk_insurance_policies(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL,
    buyer_id TEXT,
    price DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'completed', 'cancelled')),
    transaction_hash TEXT,
    multisig_signatures JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI 평가 테이블 생성
CREATE TABLE public.wellswaphk_ai_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.wellswaphk_insurance_policies(id) ON DELETE CASCADE,
    surrender_value DECIMAL(15,2),
    transfer_value DECIMAL(15,2),
    platform_price DECIMAL(15,2),
    confidence_score DECIMAL(5,2),
    risk_grade TEXT,
    adjustment_factor DECIMAL(5,2),
    reliability_score DECIMAL(5,2),
    analysis_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 문의 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RLS (Row Level Security) 활성화 (테이블 생성 직후)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 8. 기존 RLS 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

DROP POLICY IF EXISTS "Users can view own policies" ON public.wellswaphk_insurance_policies;
DROP POLICY IF EXISTS "Users can insert own policies" ON public.wellswaphk_insurance_policies;
DROP POLICY IF EXISTS "Users can update own policies" ON public.wellswaphk_insurance_policies;
DROP POLICY IF EXISTS "Admins can view all policies" ON public.wellswaphk_insurance_policies;

DROP POLICY IF EXISTS "Users can view related transactions" ON public.wellswaphk_transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON public.wellswaphk_transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.wellswaphk_transactions;

DROP POLICY IF EXISTS "Admins can manage AI evaluations" ON public.wellswaphk_ai_evaluations;

DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;

-- 9. 사용자 테이블 RLS 정책
-- 모든 사용자는 자신의 정보만 읽기/수정 가능
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- 관리자는 모든 사용자 정보 조회 가능
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 10. 보험 정책 테이블 RLS 정책
-- 사용자는 자신의 정책만 조회/수정 가능
CREATE POLICY "Users can view own policies" ON public.wellswaphk_insurance_policies
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own policies" ON public.wellswaphk_insurance_policies
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own policies" ON public.wellswaphk_insurance_policies
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = auth.uid()::text
        )
    );

-- 관리자는 모든 정책 조회/수정 가능
CREATE POLICY "Admins can view all policies" ON public.wellswaphk_insurance_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 11. 거래 테이블 RLS 정책
-- 사용자는 자신이 관련된 거래만 조회 가능
CREATE POLICY "Users can view related transactions" ON public.wellswaphk_transactions
    FOR SELECT USING (
        seller_id = auth.uid()::text OR 
        buyer_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can insert transactions" ON public.wellswaphk_transactions
    FOR INSERT WITH CHECK (
        seller_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 관리자는 모든 거래 조회/수정 가능
CREATE POLICY "Admins can manage all transactions" ON public.wellswaphk_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 12. AI 평가 테이블 RLS 정책
-- 관리자만 AI 평가 결과 조회/수정 가능
CREATE POLICY "Admins can manage AI evaluations" ON public.wellswaphk_ai_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 13. 문의 테이블 RLS 정책
-- 모든 사용자가 문의 생성 가능
CREATE POLICY "Anyone can create inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- 관리자만 문의 조회/수정 가능
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE wallet_address = auth.uid()::text AND is_admin = true
        )
    );

-- 14. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.wellswaphk_insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON public.wellswaphk_insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.wellswaphk_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.wellswaphk_transactions(status);

-- 15. 관리자 사용자 생성 (예시)
INSERT INTO public.users (wallet_address, role, is_admin) 
VALUES ('0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0', 'admin', true)
ON CONFLICT (wallet_address) DO UPDATE SET 
    role = 'admin', 
    is_admin = true;

-- 16. 테이블 권한 설정
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.wellswaphk_insurance_policies TO authenticated;
GRANT ALL ON public.wellswaphk_transactions TO authenticated;
GRANT ALL ON public.wellswaphk_ai_evaluations TO authenticated;
GRANT ALL ON public.inquiries TO authenticated;

-- 17. 시퀀스 권한 설정 (UUID 생성용)
GRANT USAGE ON SCHEMA public TO authenticated;
