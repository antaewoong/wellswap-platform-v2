'use client';

import React, { memo } from 'react';
import { Camera, Upload, DollarSign } from 'lucide-react';
import {
  AnimatedCard,
  LoadingSpinner,
  AnimatedButton,
  FadeInAnimation
} from '../animations/AnimationComponents';

interface SellPageOptimizedProps {
  t: any;
  insuranceData: any;
  setInsuranceData: React.Dispatch<React.SetStateAction<any>>;
  handleRefChange: (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFinalChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isAuthenticated: boolean;
  isWeb3Connected: boolean;
  connectedAccount: string | null;
  connectWalletWithAuth: () => void;
  isLoading: boolean;
  user: any;
  handleSellSubmitWithStats: () => void;
  globalInsurers: string[];
  globalCategories: string[];
  contractPeriods: string[];
  paidPeriods: string[];
  calculatePaymentOptions: (period: string) => string[];
  selectedFile: File | null;
  isUsingCamera: boolean;
  isOcrProcessing: boolean;
  ocrProgress: number;
  ocrResult: any;
  startCamera: () => void;
  stopCamera: () => void;
  capturePhoto: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processOCR: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const SellPageOptimized = memo<SellPageOptimizedProps>(({
  t,
  insuranceData,
  setInsuranceData,
  handleRefChange,
  handleFinalChange,
  isAuthenticated,
  isWeb3Connected,
  connectedAccount,
  connectWalletWithAuth,
  isLoading,
  user,
  handleSellSubmitWithStats,
  globalInsurers,
  globalCategories,
  contractPeriods,
  paidPeriods,
  calculatePaymentOptions,
  selectedFile,
  isUsingCamera,
  isOcrProcessing,
  ocrProgress,
  ocrResult,
  startCamera,
  stopCamera,
  capturePhoto,
  handleFileUpload,
  processOCR,
  videoRef,
  canvasRef
}) => {
  return (
    <div className="space-y-8">
      <FadeInAnimation>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t?.sell?.title || '보험 자산 판매'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t?.sell?.subtitle || 'AI 기반 자동 평가로 보험 자산을 안전하게 판매하세요'}
          </p>
        </div>
      </FadeInAnimation>

      {/* 지갑 연결 섹션 */}
      {!isWeb3Connected && (
        <AnimatedCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              지갑 연결이 필요합니다
            </h3>
            <p className="text-gray-600 mb-4">
              Polygon 지갑을 연결하여 보험 자산 판매를 시작하세요
            </p>
            <AnimatedButton onClick={connectWalletWithAuth} className="bg-blue-600 hover:bg-blue-700">
              지갑 연결하기
            </AnimatedButton>
          </div>
        </AnimatedCard>
      )}

      {/* OCR 섹션 */}
      <AnimatedCard>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">보험 계약서 업로드</h3>
          
          {/* 파일 업로드 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  파일 업로드
                </label>
              </div>
              
              <AnimatedButton
                onClick={isUsingCamera ? stopCamera : startCamera}
                className={isUsingCamera ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                <Camera className="w-5 h-5 mr-2" />
                {isUsingCamera ? '카메라 종료' : '카메라 시작'}
              </AnimatedButton>
            </div>

            {/* 카메라 프리뷰 */}
            {isUsingCamera && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-96 rounded-lg"
                />
                <div className="mt-4 text-center">
                  <AnimatedButton onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                    사진 촬영
                  </AnimatedButton>
                </div>
              </div>
            )}

            {/* 선택된 파일 미리보기 */}
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">선택된 파일: {selectedFile.name}</p>
                <div className="flex gap-4">
                  <AnimatedButton
                    onClick={processOCR}
                    disabled={isOcrProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isOcrProcessing ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                    AI 분석 시작
                  </AnimatedButton>
                </div>

                {/* OCR 진행률 */}
                {isOcrProcessing && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">분석 진행률: {ocrProgress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>

      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 보험 정보 입력 폼 */}
      <AnimatedCard>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">보험 상품 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 보험회사 */}
            <div>
              <label className="block text-sm font-medium mb-2">보험회사</label>
              <select
                value={insuranceData?.company || ''}
                onChange={handleRefChange('company')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {globalInsurers.map(insurer => (
                  <option key={insurer} value={insurer}>{insurer}</option>
                ))}
              </select>
            </div>

            {/* 상품명 */}
            <div>
              <label className="block text-sm font-medium mb-2">상품명</label>
              <input
                type="text"
                value={insuranceData?.productName || ''}
                onChange={handleFinalChange('productName')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="상품명을 입력하세요"
              />
            </div>

            {/* 상품 유형 */}
            <div>
              <label className="block text-sm font-medium mb-2">상품 유형</label>
              <select
                value={insuranceData?.category || ''}
                onChange={handleRefChange('category')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {globalCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 계약기간 */}
            <div>
              <label className="block text-sm font-medium mb-2">계약기간</label>
              <select
                value={insuranceData?.contractPeriod || ''}
                onChange={handleRefChange('contractPeriod')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {contractPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* 납입기간 */}
            <div>
              <label className="block text-sm font-medium mb-2">납입기간</label>
              <select
                value={insuranceData?.paidPeriod || ''}
                onChange={handleRefChange('paidPeriod')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {paidPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* 연간 보험료 */}
            <div>
              <label className="block text-sm font-medium mb-2">연간 보험료 ($)</label>
              <input
                type="number"
                value={insuranceData?.annualPayment || ''}
                onChange={handleFinalChange('annualPayment')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="연간 보험료를 입력하세요"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="mt-8 text-center">
            <AnimatedButton
              onClick={handleSellSubmitWithStats}
              disabled={isLoading || !isWeb3Connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3"
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
              보험 자산 등록하기
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
});

SellPageOptimized.displayName = 'SellPageOptimized';

export default SellPageOptimized;