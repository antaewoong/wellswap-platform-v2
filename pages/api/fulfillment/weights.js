// pages/api/fulfillment/weights.js
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { insurerName, productType, policyYear } = req.body

    if (!insurerName) {
      return res.status(400).json({
        success: false,
        error: '보험사명이 필요합니다.'
      })
    }

    console.log('가중치 계산 요청:', { insurerName, productType, policyYear })

    const weights = await FulfillmentAPI.getValuationWeights(
      insurerName, 
      productType, 
      policyYear
    )

    console.log('가중치 계산 결과:', weights)

    res.json({
      success: true,
      data: weights
    })

  } catch (error) {
    console.error('가중치 API 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}