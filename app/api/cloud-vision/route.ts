import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, language = 'en' } = body;

    if (!image) {
      return NextResponse.json(
        { error: '이미지 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    
    if (!apiKey) {
      // API 키가 없으면 시뮬레이션 응답
      return NextResponse.json({
        text: "Google Vision OCR 결과 (시뮬레이션)",
        confidence: 0.95,
        words: [
          { text: "AIA", confidence: 0.98 },
          { text: "Hong Kong", confidence: 0.96 },
          { text: "Policy", confidence: 0.94 },
          { text: "Number", confidence: 0.93 }
        ]
      });
    }

    // 실제 Google Vision API 호출 (구현 시 주석 해제)
    /*
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: image
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ],
              imageContext: {
                languageHints: [language]
              }
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }

    const result = await response.json();
    const textAnnotations = result.responses[0]?.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json({
        text: "",
        confidence: 0,
        words: []
      });
    }

    const fullText = textAnnotations[0].description;
    const words = textAnnotations.slice(1).map((annotation: any) => ({
      text: annotation.description,
      confidence: 0.9 // Google Vision은 개별 단어별 신뢰도를 제공하지 않음
    }));

    return NextResponse.json({
      text: fullText,
      confidence: 0.95,
      words: words
    });
    */

    // 임시 시뮬레이션 응답
    return NextResponse.json({
      text: "Google Vision OCR 결과 (시뮬레이션)",
      confidence: 0.95,
      words: [
        { text: "AIA", confidence: 0.98 },
        { text: "Hong Kong", confidence: 0.96 },
        { text: "Policy", confidence: 0.94 },
        { text: "Number", confidence: 0.93 }
      ]
    });

  } catch (error) {
    console.error('Google Vision API 오류:', error);
    return NextResponse.json(
      { error: 'OCR 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
