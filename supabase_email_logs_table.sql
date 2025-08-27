-- 이메일 로그 테이블 생성
-- Email logs table for tracking email notifications

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT DEFAULT 'noreply@wellswap.com',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);

-- RLS 정책 설정
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 이메일 로그 조회 가능
CREATE POLICY "Admin can view all email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.wallet_address = auth.jwt() ->> 'wallet_address' 
      AND users.role = 'admin'
    )
  );

-- 시스템만 이메일 로그 생성 가능
CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- 시스템만 이메일 로그 업데이트 가능
CREATE POLICY "System can update email logs" ON email_logs
  FOR UPDATE USING (true);

-- 함수: 이메일 로그 정리 (30일 이상 된 로그 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM email_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 자동 정리 스케줄 (매일 자정)
SELECT cron.schedule(
  'cleanup-email-logs',
  '0 0 * * *',
  'SELECT cleanup_old_email_logs();'
);

-- 뷰: 이메일 통계
CREATE OR REPLACE VIEW email_statistics AS
SELECT 
  DATE(created_at) as date,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
FROM email_logs
GROUP BY DATE(created_at), status
ORDER BY date DESC, status;

-- 함수: 이메일 발송 성공률 계산
CREATE OR REPLACE FUNCTION get_email_success_rate(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  total_emails BIGINT,
  sent_emails BIGINT,
  failed_emails BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_emails,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails,
    ROUND(
      (COUNT(CASE WHEN status = 'sent' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as success_rate
  FROM email_logs
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
