-- 상담 신청 테이블 생성 (안전한 버전)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 안전한 정책 생성 (role 컬럼 존재 여부와 관계없이 작동)
CREATE POLICY "모든 사용자는 상담 신청 생성 가능" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 관리자 정책 (role 컬럼이 있는 경우에만 적용)
DO $$
BEGIN
  -- role 컬럼이 존재하는지 확인
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    -- role 컬럼이 있는 경우의 정책
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
  ELSE
    -- role 컬럼이 없는 경우의 정책 (모든 사용자가 조회/수정 가능)
    CREATE POLICY "모든 사용자는 상담 신청 조회 가능" ON inquiries
      FOR SELECT USING (true);

    CREATE POLICY "모든 사용자는 상담 신청 수정 가능" ON inquiries
      FOR UPDATE USING (true);
  END IF;
END $$;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
CREATE TRIGGER update_inquiries_updated_at_trigger
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- 샘플 데이터 (선택사항)
INSERT INTO inquiries (name, phone, email, inquiry_content, status) VALUES
('김철수', '010-1234-5678', 'kim@example.com', '저축보험 전환에 대해 상담받고 싶습니다.', 'pending'),
('이영희', '010-9876-5432', 'lee@example.com', '연금보험 자산 평가 문의입니다.', 'pending'),
('박민수', '010-5555-1234', NULL, '해외 보험 자산 전환 절차가 궁금합니다.', 'in_progress')
ON CONFLICT DO NOTHING;
