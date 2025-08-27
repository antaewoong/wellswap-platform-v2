-- 상담 신청 테이블 생성
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

-- 관리자는 모든 상담 신청을 볼 수 있음 (role 컬럼이 있는 경우)
CREATE POLICY "관리자는 모든 상담 신청 조회 가능" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.wallet_address = auth.jwt() ->> 'wallet_address' 
      AND (users.role = 'admin' OR users.role IS NULL)
    )
  );

-- 관리자는 상담 신청 상태를 업데이트할 수 있음 (role 컬럼이 있는 경우)
CREATE POLICY "관리자는 상담 신청 상태 업데이트 가능" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.wallet_address = auth.jwt() ->> 'wallet_address' 
      AND (users.role = 'admin' OR users.role IS NULL)
    )
  );

-- 모든 사용자는 상담 신청을 생성할 수 있음 (인증 없이도)
CREATE POLICY "모든 사용자는 상담 신청 생성 가능" ON inquiries
  FOR INSERT WITH CHECK (true);

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
('박민수', '010-5555-1234', NULL, '해외 보험 자산 전환 절차가 궁금합니다.', 'in_progress');
