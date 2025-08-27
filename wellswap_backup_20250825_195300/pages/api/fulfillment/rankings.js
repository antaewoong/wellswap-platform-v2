// pages/api/fulfillment/rankings.js
import { FulfillmentAPI } from '../../../lib/fulfillment-api'

// 정적 내보내기에서 API 라우트 사용 시 필요한 설정
export const config = {
  api: {
    externalResolver: true,
  },
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = 20 } = req.query

    console.log('보험사 랭킹 요청:', { limit })

    const rankings = await FulfillmentAPI.getInsurerRankings(parseInt(limit))

    console.log('랭킹 조회 결과:', rankings.length, '개 보험사')

    res.json({
      success: true,
      data: rankings,
      metadata: {
        total: rankings.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('랭킹 API 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}