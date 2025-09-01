import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/database-wellswap';

interface InquiryRequest {
  name: string;
  phone: string;
  email?: string;
  inquiry?: string;
  inquiryContent?: string; // 새로운 필드명 지원
  source?: string;
  // 새로운 Zoom 컨시어지 필드들
  preferredMessenger?: string;
  messengerId?: string;
  consultationDate?: string;
  consultationTime?: string;
  timezone?: string;
  consultationType?: string;
  requestedDateTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InquiryRequest = await request.json();
    const { 
      name, 
      phone, 
      email, 
      inquiry, 
      inquiryContent,
      source = 'zoom_concierge_form',
      preferredMessenger,
      messengerId,
      consultationDate,
      consultationTime,
      timezone = 'HKT',
      consultationType = 'zoom_video_call',
      requestedDateTime
    } = body;

    // 문의내용 필드 통합 처리
    const finalInquiry = inquiryContent || inquiry;

    // 기본 검증
    if (!name || !phone || !finalInquiry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name, phone number, and consultation requirements are required.' 
        },
        { status: 400 }
      );
    }

    // Zoom 컨시어지 전용 추가 검증
    if (consultationType === 'zoom_video_call') {
      if (!consultationDate || !consultationTime) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Please select your preferred consultation date and time.' 
          },
          { status: 400 }
        );
      }
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '올바른 전화번호 형식을 입력해주세요.' 
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증 (선택사항)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { 
            success: false, 
            error: '올바른 이메일 형식을 입력해주세요.' 
          },
          { status: 400 }
        );
      }
    }

    // 데이터베이스에 저장 (확장된 스키마)
    const supabase = getSupabase();
    let inquiryId = null;
    
    if (supabase) {
      const insertData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        inquiry: finalInquiry.trim(),
        source,
        status: 'new',
        created_at: new Date().toISOString(),
        // 새로운 Zoom 컨시어지 필드들
        consultation_type: consultationType,
        preferred_messenger: preferredMessenger,
        messenger_id: messengerId?.trim() || null,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        timezone: timezone,
        requested_datetime: requestedDateTime,
        // 메타데이터
        is_zoom_consultation: consultationType === 'zoom_video_call',
        priority: consultationType === 'zoom_video_call' ? 'high' : 'normal'
      };

      const { data, error } = await supabase
        .from('inquiries')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('데이터베이스 저장 오류:', error);
      } else {
        inquiryId = data?.id;
        console.log('✅ 프리미엄 컨시어지 예약 저장 완료:', inquiryId);
      }
    }

    // 향상된 텔레그램 알림 발송 (Zoom 컨시어지 정보 포함)
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;
      
      if (telegramBotToken && telegramChatId) {
        const isZoomConsultation = consultationType === 'zoom_video_call';
        const consultationDateTime = consultationDate && consultationTime 
          ? `${consultationDate} at ${consultationTime} ${timezone}` 
          : 'Not specified';

        const telegramMessage = `
${isZoomConsultation ? '📹' : '🔔'} <b>${isZoomConsultation ? 'NEW ZOOM CONSULTATION REQUEST' : 'New Concierge Inquiry'}</b>

<b>👤 Client:</b> ${name}
<b>📞 Phone:</b> ${phone}
<b>📧 Email:</b> ${email || 'Not provided'}

${isZoomConsultation ? `<b>📅 Requested Time:</b> ${consultationDateTime}
<b>📱 Messenger:</b> ${preferredMessenger || 'Not specified'}${messengerId ? ` (${messengerId})` : ''}
<b>🎥 Type:</b> Premium Zoom Video Consultation` : ''}

<b>📝 Requirements:</b>
${finalInquiry}

<b>🕐 Submitted:</b> ${new Date().toLocaleString('en-US', { 
  timeZone: 'Asia/Hong_Kong',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
})} HKT
<b>🆔 ID:</b> ${inquiryId || 'N/A'}
<b>⚡ Priority:</b> ${isZoomConsultation ? 'HIGH' : 'NORMAL'}
        `.trim();

        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        }).catch(err => console.error('텔레그램 알림 실패:', err));
      }
    } catch (telegramError) {
      console.error('텔레그램 알림 오류:', telegramError);
    }

    // 자동 응답 이메일 발송 (비동기)
    if (email) {
      try {
        const emailResponse = await fetch(`${request.nextUrl.origin}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: '웰스왑 컨시어지 문의 접수 확인',
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2d3748;">웰스왑 컨시어지 서비스</h2>
                
                <p>안녕하세요 ${name}님,</p>
                
                <p>웰스왑 컨시어지 서비스에 문의해 주셔서 감사합니다. 
                고객님의 문의가 정상적으로 접수되었습니다.</p>
                
                <div style="background-color: #f7fafc; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
                  <h3 style="margin-top: 0;">접수된 문의 내용</h3>
                  <p><strong>이름:</strong> ${name}</p>
                  <p><strong>전화번호:</strong> ${phone}</p>
                  <p><strong>문의내용:</strong><br>${(finalInquiry || '').replace(/\n/g, '<br>')}</p>
                  <p><strong>접수시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                </div>
                
                <p>전문 상담사가 확인 후 영업시간 내에 연락드리겠습니다.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 14px;">
                    <strong>웰스왑 컨시어지 팀</strong><br>
                    📧 concierge@wellswap.com<br>
                    📞 +852 1234 5678<br>
                    🕒 평일 09:00-18:00 (홍콩시간)
                  </p>
                </div>
              </div>
            `,
            type: 'inquiry_confirmation'
          })
        });

        if (!emailResponse.ok) {
          console.error('자동 응답 이메일 발송 실패');
        }
      } catch (emailError) {
        console.error('이메일 발송 오류:', emailError);
      }
    }

    // 성공 응답 메시지 개선
    const successMessage = consultationType === 'zoom_video_call'
      ? 'Premium consultation request submitted successfully. Our team will contact you within 24 hours to confirm your Zoom appointment.'
      : 'Your inquiry has been submitted successfully. We will contact you soon.';

    return NextResponse.json({
      success: true,
      message: successMessage,
      inquiryId,
      consultationType,
      scheduledDateTime: consultationDate && consultationTime 
        ? `${consultationDate} ${consultationTime} ${timezone}`
        : null
    });

  } catch (error) {
    console.error('인퀴어리 처리 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
      { status: 500 }
    );
  }
}