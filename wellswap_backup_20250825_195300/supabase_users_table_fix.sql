-- users 테이블에 role 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 기존 사용자들의 role을 기본값으로 설정
UPDATE users SET role = 'user' WHERE role IS NULL;

-- role 컬럼에 제약 조건 추가
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- RLS (Row Level Security) 정책 업데이트
-- 기존 정책이 있다면 삭제
DROP POLICY IF EXISTS "관리자는 모든 상담 신청 조회 가능" ON inquiries;
DROP POLICY IF EXISTS "관리자는 상담 신청 상태 업데이트 가능" ON inquiries;
DROP POLICY IF EXISTS "모든 사용자는 상담 신청 생성 가능" ON inquiries;

-- 새로운 정책 생성 (role 컬럼 사용)
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

CREATE POLICY "모든 사용자는 상담 신청 생성 가능" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 관리자 사용자 추가 (예시)
INSERT INTO users (wallet_address, role, reputation_score, total_trades, created_at) 
VALUES 
  ('0x1234567890123456789012345678901234567890', 'admin', 100, 0, NOW()),
  ('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'admin', 100, 0, NOW())
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
