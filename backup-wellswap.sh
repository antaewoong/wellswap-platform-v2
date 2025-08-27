#!/bin/bash

# WellSwap 프로젝트 전체 백업 스크립트
# 실행 방법: chmod +x backup-wellswap.sh && ./backup-wellswap.sh

echo "🚀 WellSwap 프로젝트 백업 시작..."

# 현재 날짜와 시간으로 백업 폴더명 생성
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="wellswap_backup_${BACKUP_DATE}"
BACKUP_PATH="./${BACKUP_DIR}"

echo "📁 백업 폴더: ${BACKUP_PATH}"

# 백업 폴더 생성
mkdir -p "${BACKUP_PATH}"

# 1. 핵심 소스 코드 백업
echo "📦 핵심 소스 코드 백업 중..."
mkdir -p "${BACKUP_PATH}/app"
cp -r app/* "${BACKUP_PATH}/app/" 2>/dev/null || echo "⚠️ app 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/components"
cp -r components/* "${BACKUP_PATH}/components/" 2>/dev/null || echo "⚠️ components 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/lib"
cp -r lib/* "${BACKUP_PATH}/lib/" 2>/dev/null || echo "⚠️ lib 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/hooks"
cp -r hooks/* "${BACKUP_PATH}/hooks/" 2>/dev/null || echo "⚠️ hooks 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/types"
cp -r types/* "${BACKUP_PATH}/types/" 2>/dev/null || echo "⚠️ types 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/constants"
cp -r constants/* "${BACKUP_PATH}/constants/" 2>/dev/null || echo "⚠️ constants 폴더 백업 실패"

mkdir -p "${BACKUP_PATH}/utils"
cp -r utils/* "${BACKUP_PATH}/utils/" 2>/dev/null || echo "⚠️ utils 폴더 백업 실패"

# 2. 설정 파일 백업
echo "⚙️ 설정 파일 백업 중..."
cp package.json "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ package.json 백업 실패"
cp package-lock.json "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ package-lock.json 백업 실패"
cp next.config.js "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ next.config.js 백업 실패"
cp next.config.ts "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ next.config.ts 백업 실패"
cp tsconfig.json "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ tsconfig.json 백업 실패"
cp tailwind.config.js "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ tailwind.config.js 백업 실패"
cp postcss.config.js "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ postcss.config.js 백업 실패"
cp postcss.config.mjs "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ postcss.config.mjs 백업 실패"

# 3. 배포 설정 파일 백업
echo "🚀 배포 설정 파일 백업 중..."
cp netlify.toml "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ netlify.toml 백업 실패"
cp vercel.json "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ vercel.json 백업 실패"

# 4. 정적 파일 백업
echo "🖼️ 정적 파일 백업 중..."
mkdir -p "${BACKUP_PATH}/public"
cp -r public/* "${BACKUP_PATH}/public/" 2>/dev/null || echo "⚠️ public 폴더 백업 실패"

# 5. 문서 파일 백업
echo "📄 문서 파일 백업 중..."
cp README.md "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ README.md 백업 실패"
cp *.md "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ 마크다운 파일 백업 실패"

# 6. SQL 파일 백업
echo "🗄️ SQL 파일 백업 중..."
cp *.sql "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ SQL 파일 백업 실패"

# 7. API 라우트 백업
echo "🔗 API 라우트 백업 중..."
mkdir -p "${BACKUP_PATH}/pages/api"
cp -r pages/api/* "${BACKUP_PATH}/pages/api/" 2>/dev/null || echo "⚠️ pages/api 폴더 백업 실패"

# 8. 환경 변수 파일 백업 (보안 주의)
echo "🔐 환경 변수 파일 백업 중..."
if [ -f ".env.local" ]; then
    cp .env.local "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ .env.local 백업 실패"
fi
if [ -f ".env" ]; then
    cp .env "${BACKUP_PATH}/" 2>/dev/null || echo "⚠️ .env 백업 실패"
fi

# 9. 백업 정보 파일 생성
echo "📋 백업 정보 파일 생성 중..."
cat > "${BACKUP_PATH}/backup_info.txt" << EOF
WellSwap 프로젝트 백업 정보
============================
백업 일시: $(date)
백업 폴더: ${BACKUP_PATH}
프로젝트 버전: $(node -v 2>/dev/null || echo "Node.js 버전 확인 불가")
NPM 버전: $(npm -v 2>/dev/null || echo "NPM 버전 확인 불가")

백업된 폴더:
- app/ (Next.js 앱 라우터)
- components/ (React 컴포넌트)
- lib/ (유틸리티 라이브러리)
- hooks/ (React 훅)
- types/ (TypeScript 타입 정의)
- constants/ (상수 정의)
- utils/ (유틸리티 함수)
- public/ (정적 파일)
- pages/api/ (API 라우트)

백업된 설정 파일:
- package.json (의존성)
- next.config.js/ts (Next.js 설정)
- tsconfig.json (TypeScript 설정)
- tailwind.config.js (Tailwind CSS 설정)
- postcss.config.js/mjs (PostCSS 설정)
- netlify.toml (Netlify 배포 설정)
- vercel.json (Vercel 배포 설정)

백업된 문서:
- README.md
- *.md (모든 마크다운 파일)
- *.sql (데이터베이스 스키마)

주의사항:
1. .env 파일이 포함되어 있으므로 보안에 주의하세요
2. node_modules는 백업하지 않았습니다 (npm install로 재설치 가능)
3. .git 폴더는 백업하지 않았습니다 (Git 히스토리는 별도 관리)

복원 방법:
1. 새 폴더에 백업 파일들을 복사
2. npm install 실행
3. 환경 변수 설정
4. npm run dev로 개발 서버 실행
EOF

# 10. 압축 파일 생성
echo "🗜️ 압축 파일 생성 중..."
tar -czf "${BACKUP_DIR}.tar.gz" "${BACKUP_DIR}" 2>/dev/null || echo "⚠️ 압축 파일 생성 실패"

# 11. 백업 완료 보고서
echo "✅ 백업 완료!"
echo ""
echo "📊 백업 결과:"
echo "   📁 백업 폴더: ${BACKUP_PATH}"
echo "   🗜️ 압축 파일: ${BACKUP_DIR}.tar.gz"
echo "   📋 정보 파일: ${BACKUP_PATH}/backup_info.txt"
echo ""
echo "📦 백업된 주요 파일들:"
find "${BACKUP_PATH}" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -10 | while read file; do
    echo "   ✅ $(basename "$file")"
done
echo "   ... (총 $(find "${BACKUP_PATH}" -type f | wc -l)개 파일)"
echo ""
echo "🔒 보안 주의사항:"
echo "   - .env 파일이 포함되어 있으므로 안전한 곳에 보관하세요"
echo "   - 백업 파일을 공유할 때는 환경 변수를 제거하세요"
echo ""
echo "🔄 복원 방법:"
echo "   1. tar -xzf ${BACKUP_DIR}.tar.gz"
echo "   2. cd ${BACKUP_DIR}"
echo "   3. npm install"
echo "   4. 환경 변수 설정"
echo "   5. npm run dev"
echo ""
echo "🎉 WellSwap 프로젝트 백업이 성공적으로 완료되었습니다!"
