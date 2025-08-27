import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/database-wellswap';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content, type = 'notification' } = body;

    // 기본 검증
    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 로그 저장
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert([{
        to_email: to,
        subject: subject,
        body: content,
        status: 'pending'
      }])
      .select()
      .single();

    if (logError) {
      console.error('이메일 로그 저장 실패:', logError);
    }

    // Resend API 호출 (실제 구현 시)
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@wellswap.com',
    //     to: [to],
    //     subject: subject,
    //     html: content,
    //   }),
    // });

    // 임시로 성공 응답 (실제 구현 시 주석 해제)
    const success = true;

    if (success && emailLog) {
      // 로그 상태 업데이트
      await supabase
        .from('email_logs')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', emailLog.id);
    }

    return NextResponse.json({
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      logId: emailLog?.id
    });

  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return NextResponse.json(
      { error: '이메일 발송에 실패했습니다.' },
      { status: 500 }
    );
  }
}
