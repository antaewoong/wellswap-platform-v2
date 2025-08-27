'use client'

import { useState } from 'react'
import { TrendingUp, FileText, BarChart3, Users, CheckCircle } from 'lucide-react'

interface AnalysisResult {
  estimated_value: number
  market_recommendation: string
  risk_level: string
  transferability: string
  summary: string
}

export default function AIInsuranceAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    policy_type: 'Universal Life',
    coverage_amount: 250000,
    premium_amount: 5000,
    years_remaining: 15,
    company: 'AIA Hong Kong'
  })

  const analyzeInsurance = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8001/api/analyze-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('AI 서버 연결 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            WellSwapHK AI Insurance Analysis
          </h1>
          <p className="text-lg text-gray-600">
            홍콩 보험 상품의 실시간 AI 분석 및 거래 매칭 서비스
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 입력 패널 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FileText className="mr-2 text-blue-600" />
              보험 정보 입력
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">보험 종류</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.policy_type}
                  onChange={(e) => setFormData({...formData, policy_type: e.target.value})}
                >
                  <option>Universal Life</option>
                  <option>Whole Life</option>
                  <option>Term Life</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">보장 금액 (USD)</label>
                <input 
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData({...formData, coverage_amount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연간 보험료 (USD)</label>
                <input 
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.premium_amount}
                  onChange={(e) => setFormData({...formData, premium_amount: Number(e.target.value)})}
                />
              </div>

              <button
                onClick={analyzeInsurance}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <BarChart3 className="mr-2" />
                )}
                {loading ? 'AI 분석 중...' : 'AI 분석 시작'}
              </button>
            </div>
          </div>

          {/* 결과 패널 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <TrendingUp className="mr-2 text-green-600" />
              AI 분석 결과
            </h2>

            {result ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">추정 시장 가치</h3>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.estimated_value.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700">거래 추천</h4>
                    <p className="font-semibold text-green-600">{result.market_recommendation}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700">리스크 레벨</h4>
                    <p className="font-semibold text-yellow-600">{result.risk_level}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">분석 요약</h3>
                  <p className="text-blue-700">{result.summary}</p>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center">
                    <Users className="mr-2" />
                    구매자 매칭
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
                    <CheckCircle className="mr-2" />
                    거래 시작
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="mx-auto mb-4 w-16 h-16 text-gray-300" />
                <p>보험 정보를 입력하고 AI 분석을 시작해보세요</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">WellSwapHK AI Server Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}