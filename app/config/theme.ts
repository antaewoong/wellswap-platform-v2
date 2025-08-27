// WellSwap Theme Configuration
// 서버와 클라이언트 간 Hydration Mismatch 방지

export const THEME_ROOT_CLASS = 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50';

// 대안 테마 (필요시 사용)
export const THEME_ROOT_CLASS_ALTERNATIVE = 'min-h-screen bg-zinc-50 text-zinc-900';

// 테마 유틸리티 함수
export const getThemeClass = (variant: 'default' | 'alternative' = 'default') => {
  return variant === 'default' ? THEME_ROOT_CLASS : THEME_ROOT_CLASS_ALTERNATIVE;
};

// 하이드레이션 경고 억제를 위한 설정
export const HYDRATION_SUPPRESS = true;
