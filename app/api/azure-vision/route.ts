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

    const endpoint = process.env.AZURE_VISION_ENDPOINT;
    const apiKey = process.env.AZURE_VISION_API_KEY;
    
    if (!endpoint || !apiKey) {
      // API 키가 없으면 시뮬레이션 응답
      return NextResponse.json({
        text: "Azure Vision OCR 결과 (시뮬레이션)",
        confidence: 0.93,
        words: [
          { text: "Prudential", confidence: 0.97 },
          { text: "Insurance", confidence: 0.95 },
          { text: "Policy", confidence: 0.94 },
          { text: "Document", confidence: 0.92 }
        ]
      });
    }

    // 실제 Azure Vision API 호출 (구현 시 주석 해제)
    /*
    const response = await fetch(
      `${endpoint}/vision/v3.2/read/analyze`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: Buffer.from(image, 'base64')
      }
    );

    if (!response.ok) {
      throw new Error(`Azure Vision API error: ${response.status}`);
    }

    const operationLocation = response.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('Operation location not found');
    }

    // 결과 대기
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        }
      });

      if (resultResponse.ok) {
        result = await resultResponse.json();
        if (result.status === 'succeeded') {
          break;
        }
      }
    }

    if (!result || result.status !== 'succeeded') {
      throw new Error('OCR processing timeout');
    }

    const readResults = result.analyzeResult?.readResults || [];
    const text = readResults
      .flatMap(page => page.lines)
      .map(line => line.text)
      .join(' ');

    const words = readResults
      .flatMap(page => page.lines)
      .flatMap(line => line.words)
      .map(word => ({
        text: word.text,
        confidence: word.confidence || 0.9
      }));

    return NextResponse.json({
      text: text,
      confidence: 0.93,
      words: words
    });
    */

    // 임시 시뮬레이션 응답
    return NextResponse.json({
      text: "Azure Vision OCR 결과 (시뮬레이션)",
      confidence: 0.93,
      words: [
        { text: "Prudential", confidence: 0.97 },
        { text: "Insurance", confidence: 0.95 },
        { text: "Policy", confidence: 0.94 },
        { text: "Document", confidence: 0.92 }
      ]
    });

  } catch (error) {
    console.error('Azure Vision API 오류:', error);
    return NextResponse.json(
      { error: 'OCR 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
