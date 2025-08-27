// components/reliability/ReliabilityScore.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ReliabilityScoreProps {
  insurerName: string;
  showDetails?: boolean;
  className?: string;
}

interface ReliabilityData {
  score: number;
  grade: string;
  confidence: string;
  details: {
    avgAnnualDividend?: number;
    avgReversionaryBonus?: number;
    avgTerminalDividend?: number;
    consistency?: number;
    dataPoints?: number;
    message?: string;
  };
}

const ReliabilityScore: React.FC<ReliabilityScoreProps> = ({ 
  insurerName, 
  showDetails = false,
  className = ""
}) => {
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (insurerName && insurerName.trim()) {
      loadReliability();
    }
  }, [insurerName]);

  const loadReliability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fulfillment/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          insurerName: insurerName.trim()
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.reliabilityScore) {
        setReliability(result.data.reliabilityScore);
      } else {
        setError('신뢰도 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('신뢰도 로드 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeIcon = (grade: string) => {
    if (grade.startsWith('A')) return <CheckCircle className="w-4 h-4" />;
    if (grade.startsWith('B')) return <TrendingUp className="w-4 h-4" />;
    if (grade.startsWith('C')) return <Shield className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getConfidenceText = (confidence: string) => {
    const confidenceMap: { [key: string]: string } = {
      'VERY_HIGH': '매우 높음',
      'HIGH': '높음',
      'MEDIUM_HIGH': '보통 이상',
      'MEDIUM': '보통',
      'MEDIUM_LOW': '보통 이하',
      'LOW': '낮음',
      'VERY_LOW': '매우 낮음'
    };
    return confidenceMap[confidence] || confidence;
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">신뢰도 분석 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-gray-400 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!reliability) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        신뢰도 정보 없음
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 기본 점수 및 등급 표시 */}
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(reliability.score)}`}>
          {getGradeIcon(reliability.grade)}
          <span>{reliability.grade}</span>
          <span>({reliability.score}/100)</span>
        </div>
        
        <div className="text-xs text-gray-500">
          신뢰도: {getConfidenceText(reliability.confidence)}
        </div>
      </div>

      {/* 상세 정보 표시 */}
      {showDetails && reliability.details && (
        <div className="text-xs text-gray-600 space-y-1 pl-2 border-l-2 border-gray-100">
          {reliability.details.message ? (
            <div className="text-gray-500">{reliability.details.message}</div>
          ) : (
            <>
              {reliability.details.avgAnnualDividend && reliability.details.avgAnnualDividend > 0 && (
                <div className="flex justify-between">
                  <span>연간배당 평균:</span>
                  <span className="font-mono">{reliability.details.avgAnnualDividend.toFixed(1)}%</span>
                </div>
              )}
              
              {reliability.details.avgReversionaryBonus && reliability.details.avgReversionaryBonus > 0 && (
                <div className="flex justify-between">
                  <span>복귀보너스 평균:</span>
                  <span className="font-mono">{reliability.details.avgReversionaryBonus.toFixed(1)}%</span>
                </div>
              )}
              
              {reliability.details.avgTerminalDividend && reliability.details.avgTerminalDividend > 0 && (
                <div className="flex justify-between">
                  <span>종료배당 평균:</span>
                  <span className="font-mono">{reliability.details.avgTerminalDividend.toFixed(1)}%</span>
                </div>
              )}
              
              {reliability.details.consistency && reliability.details.consistency > 0 && (
                <div className="flex justify-between">
                  <span>일관성 점수:</span>
                  <span className="font-mono">{reliability.details.consistency.toFixed(1)}%</span>
                </div>
              )}
              
              {reliability.details.dataPoints && (
                <div className="flex justify-between">
                  <span>데이터 포인트:</span>
                  <span className="font-mono">{reliability.details.dataPoints}개</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReliabilityScore;