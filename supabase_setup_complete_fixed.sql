-- WellSwap Supabase 완전 설정 스크립트
-- 실행 순서: 1. inquiries 테이블 생성 -> 2. users 테이블 수정 -> 3. 정책 설정

-- 1. inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  inquiry_content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- inquiries 테이블 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- 2. users 테이블 수정 (role 컬럼 추가)
-- users 테이블에 role 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 기존 사용자들의 role을 기본값으로 설정
UPDATE users SET role = 'user' WHERE role IS NULL;

-- role 컬럼에 제약 조건 추가
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));

-- users 테이블 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- 3. RLS (Row Level Security) 설정
-- inquiries 테이블 RLS 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "관리자는 모든 상담 신청 조회 가능" ON inquiries;
DROP POLICY IF EXISTS "관리자는 상담 신청 상태 업데이트 가능" ON inquiries;
DROP POLICY IF EXISTS "모든 사용자는 상담 신청 생성 가능" ON inquiries;
DROP POLICY IF EXISTS "모든 사용자는 상담 신청 조회 가능" ON inquiries;
DROP POLICY IF EXISTS "모든 사용자는 상담 신청 수정 가능" ON inquiries;

-- 새로운 정책 생성
CREATE POLICY "모든 사용자는 상담 신청 생성 가능" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "관리자는 모든 상담 신청 조회 가능" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.wallet_address = auth.jwt() ->> 'wallet_address' 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "관리자는 상담 신청 상태 업데이트 가능" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.wallet_address = auth.jwt() ->> 'wallet_address' 
      AND users.role = 'admin'
    )
  );

-- 4. 트리거 함수 생성
-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
DROP TRIGGER IF EXISTS update_inquiries_updated_at_trigger ON inquiries;
CREATE TRIGGER update_inquiries_updated_at_trigger
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- 5. 샘플 데이터 삽입
-- 관리자 사용자 추가 (실제 지갑 주소로 변경 필요)
INSERT INTO users (wallet_address, role, reputation_score, total_trades, created_at) 
VALUES 
  ('0x1234567890123456789012345678901234567890', 'admin', 100, 0, NOW()),
  ('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'admin', 100, 0, NOW())
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- 샘플 상담 신청 데이터
INSERT INTO inquiries (name, phone, email, inquiry_content, status) VALUES
('김철수', '010-1234-5678', 'kim@example.com', '저축보험 전환에 대해 상담받고 싶습니다.', 'pending'),
('이영희', '010-9876-5432', 'lee@example.com', '연금보험 자산 평가 문의입니다.', 'pending'),
('박민수', '010-5555-1234', NULL, '해외 보험 자산 전환 절차가 궁금합니다.', 'in_progress')
ON CONFLICT DO NOTHING;

-- 6. 테이블 구조 확인
-- users 테이블 구조 확인
SELECT 
  'users' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- inquiries 테이블 구조 확인
SELECT 
  'inquiries' as table_name,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'inquiries' 
ORDER BY ordinal_position;

-- 생성된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'inquiries')
ORDER BY tablename, policyname;
