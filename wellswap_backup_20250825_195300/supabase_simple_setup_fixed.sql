-- WellSwap Supabase 간단 설정 스크립트
-- 이 스크립트는 순서대로 실행되어야 합니다.

-- 1단계: inquiries 테이블 생성
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

-- 2단계: users 테이블에 role 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 3단계: RLS 활성화 및 정책 설정
-- inquiries 테이블 RLS 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 간단한 정책 설정 (모든 사용자가 모든 작업 가능)
CREATE POLICY "모든 사용자 접근 허용" ON inquiries
  FOR ALL USING (true);

-- 4단계: 샘플 데이터 추가
-- 샘플 상담 신청 데이터
INSERT INTO inquiries (name, phone, email, inquiry_content, status) VALUES
('김철수', '010-1234-5678', 'kim@example.com', '저축보험 전환에 대해 상담받고 싶습니다.', 'pending'),
('이영희', '010-9876-5432', 'lee@example.com', '연금보험 자산 평가 문의입니다.', 'pending'),
('박민수', '010-5555-1234', NULL, '해외 보험 자산 전환 절차가 궁금합니다.', 'in_progress')
ON CONFLICT DO NOTHING;

-- 5단계: 확인 쿼리
-- 테이블이 생성되었는지 확인
SELECT 'inquiries' as table_name, COUNT(*) as row_count FROM inquiries
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users;
