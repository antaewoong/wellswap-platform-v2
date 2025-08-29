-- Supabase RLS 완전 비활성화 (무한 재귀 문제 해결)
-- Supabase SQL Editor에서 실행하세요

-- 1. 모든 RLS 정책 삭제
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

-- 2. 모든 테이블의 RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_insurance_policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellswaphk_ai_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;

-- 3. 권한 재설정 (모든 사용자가 모든 테이블에 접근 가능)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4. 시퀀스 권한도 설정
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 완료! 이제 무한 재귀 문제가 해결되었습니다.
