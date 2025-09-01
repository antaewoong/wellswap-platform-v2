'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-800 mb-4">404</h1>
        <p className="text-neutral-600 mb-6">페이지를 찾을 수 없습니다.</p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}