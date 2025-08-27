import { NextRequest, NextResponse } from 'next/server';

// 정적 내보내기에서 API 라우트 사용 시 필요한 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?auth_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?auth_error=no_code`);
  }

  // 부모 창에 인증 코드 전송
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Complete</title>
    </head>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            code: '${code}'
          }, '${process.env.NEXT_PUBLIC_BASE_URL}');
          window.close();
        } else {
          window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}?auth_code=${code}';
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
