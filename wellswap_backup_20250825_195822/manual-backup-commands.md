# 📦 WellSwap 수동 백업 명령어

## 🖥️ macOS/Linux 사용자

### 1. 전체 프로젝트 백업 (권장)
```bash
# 현재 날짜로 백업 폴더 생성
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="wellswap_backup_${BACKUP_DATE}"

# 백업 폴더 생성
mkdir -p "$BACKUP_DIR"

# 핵심 폴더들 백업
cp -r app "$BACKUP_DIR/"
cp -r components "$BACKUP_DIR/"
cp -r lib "$BACKUP_DIR/"
cp -r hooks "$BACKUP_DIR/"
cp -r types "$BACKUP_DIR/"
cp -r constants "$BACKUP_DIR/"
cp -r utils "$BACKUP_DIR/"
cp -r public "$BACKUP_DIR/"
cp -r pages "$BACKUP_DIR/"

# 설정 파일들 백업
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/"
cp next.config.js "$BACKUP_DIR/"
cp next.config.ts "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"
cp tailwind.config.js "$BACKUP_DIR/"
cp postcss.config.js "$BACKUP_DIR/"
cp postcss.config.mjs "$BACKUP_DIR/"
cp netlify.toml "$BACKUP_DIR/"
cp vercel.json "$BACKUP_DIR/"

# 문서 파일들 백업
cp README.md "$BACKUP_DIR/"
cp *.md "$BACKUP_DIR/"
cp *.sql "$BACKUP_DIR/"

# 환경 변수 파일 백업 (보안 주의)
cp .env.local "$BACKUP_DIR/" 2>/dev/null || echo ".env.local 없음"
cp .env "$BACKUP_DIR/" 2>/dev/null || echo ".env 없음"

# 압축 파일 생성
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

echo "✅ 백업 완료: ${BACKUP_DIR}.tar.gz"
```

### 2. 빠른 백업 (핵심 파일만)
```bash
# 현재 날짜로 백업
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="wellswap_quick_backup_${BACKUP_DATE}"

mkdir -p "$BACKUP_DIR"

# 핵심 소스 코드만 백업
cp -r app components lib hooks types constants utils public pages "$BACKUP_DIR/"

# 설정 파일 백업
cp package*.json next.config.* tsconfig.json tailwind.config.js postcss.config.* netlify.toml vercel.json "$BACKUP_DIR/"

# 문서 백업
cp *.md *.sql "$BACKUP_DIR/"

# 압축
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

echo "✅ 빠른 백업 완료: ${BACKUP_DIR}.tar.gz"
```

### 3. Git 기반 백업 (Git 사용자)
```bash
# 현재 상태를 새로운 브랜치로 백업
BACKUP_BRANCH="backup_$(date +"%Y%m%d_%H%M%S")"
git checkout -b "$BACKUP_BRANCH"
git add .
git commit -m "Backup: $(date)"
git push origin "$BACKUP_BRANCH"

echo "✅ Git 백업 완료: $BACKUP_BRANCH"
```

## 🪟 Windows 사용자

### 1. PowerShell을 사용한 백업
```powershell
# 현재 날짜로 백업 폴더 생성
$BACKUP_DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "wellswap_backup_$BACKUP_DATE"

# 백업 폴더 생성
New-Item -ItemType Directory -Path $BACKUP_DIR

# 핵심 폴더들 백업
Copy-Item -Path "app" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "components" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "lib" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "hooks" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "types" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "constants" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "utils" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "public" -Destination $BACKUP_DIR -Recurse -Force
Copy-Item -Path "pages" -Destination $BACKUP_DIR -Recurse -Force

# 설정 파일들 백업
Copy-Item -Path "package.json" -Destination $BACKUP_DIR -Force
Copy-Item -Path "package-lock.json" -Destination $BACKUP_DIR -Force
Copy-Item -Path "next.config.js" -Destination $BACKUP_DIR -Force
Copy-Item -Path "next.config.ts" -Destination $BACKUP_DIR -Force
Copy-Item -Path "tsconfig.json" -Destination $BACKUP_DIR -Force
Copy-Item -Path "tailwind.config.js" -Destination $BACKUP_DIR -Force
Copy-Item -Path "postcss.config.js" -Destination $BACKUP_DIR -Force
Copy-Item -Path "postcss.config.mjs" -Destination $BACKUP_DIR -Force
Copy-Item -Path "netlify.toml" -Destination $BACKUP_DIR -Force
Copy-Item -Path "vercel.json" -Destination $BACKUP_DIR -Force

# 문서 파일들 백업
Copy-Item -Path "*.md" -Destination $BACKUP_DIR -Force
Copy-Item -Path "*.sql" -Destination $BACKUP_DIR -Force

# 환경 변수 파일 백업 (보안 주의)
if (Test-Path ".env.local") { Copy-Item -Path ".env.local" -Destination $BACKUP_DIR -Force }
if (Test-Path ".env") { Copy-Item -Path ".env" -Destination $BACKUP_DIR -Force }

# 압축 파일 생성
Compress-Archive -Path $BACKUP_DIR -DestinationPath "$BACKUP_DIR.zip" -Force

Write-Host "✅ 백업 완료: $BACKUP_DIR.zip"
```

### 2. 명령 프롬프트를 사용한 백업
```cmd
REM 현재 날짜로 백업 폴더 생성
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_DATE=%dt:~0,8%_%dt:~8,6%"
set "BACKUP_DIR=wellswap_backup_%BACKUP_DATE%"

REM 백업 폴더 생성
mkdir "%BACKUP_DIR%"

REM 핵심 폴더들 백업
xcopy "app" "%BACKUP_DIR%\app\" /E /I /Y
xcopy "components" "%BACKUP_DIR%\components\" /E /I /Y
xcopy "lib" "%BACKUP_DIR%\lib\" /E /I /Y
xcopy "hooks" "%BACKUP_DIR%\hooks\" /E /I /Y
xcopy "types" "%BACKUP_DIR%\types\" /E /I /Y
xcopy "constants" "%BACKUP_DIR%\constants\" /E /I /Y
xcopy "utils" "%BACKUP_DIR%\utils\" /E /I /Y
xcopy "public" "%BACKUP_DIR%\public\" /E /I /Y
xcopy "pages" "%BACKUP_DIR%\pages\" /E /I /Y

REM 설정 파일들 백업
copy "package.json" "%BACKUP_DIR%\"
copy "package-lock.json" "%BACKUP_DIR%\"
copy "next.config.js" "%BACKUP_DIR%\"
copy "next.config.ts" "%BACKUP_DIR%\"
copy "tsconfig.json" "%BACKUP_DIR%\"
copy "tailwind.config.js" "%BACKUP_DIR%\"
copy "postcss.config.js" "%BACKUP_DIR%\"
copy "postcss.config.mjs" "%BACKUP_DIR%\"
copy "netlify.toml" "%BACKUP_DIR%\"
copy "vercel.json" "%BACKUP_DIR%\"

REM 문서 파일들 백업
copy "*.md" "%BACKUP_DIR%\"
copy "*.sql" "%BACKUP_DIR%\"

REM 환경 변수 파일 백업 (보안 주의)
if exist ".env.local" copy ".env.local" "%BACKUP_DIR%\"
if exist ".env" copy ".env" "%BACKUP_DIR%\"

echo ✅ 백업 완료: %BACKUP_DIR%
```

## 🔄 복원 방법

### macOS/Linux
```bash
# 압축 파일 해제
tar -xzf wellswap_backup_YYYYMMDD_HHMMSS.tar.gz

# 백업 폴더로 이동
cd wellswap_backup_YYYYMMDD_HHMMSS

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# 또는 수동으로 .env.local 파일 생성

# 개발 서버 실행
npm run dev
```

### Windows
```powershell
# 압축 파일 해제
Expand-Archive -Path "wellswap_backup_YYYYMMDD_HHMMSS.zip" -DestinationPath "."

# 백업 폴더로 이동
cd wellswap_backup_YYYYMMDD_HHMMSS

# 의존성 설치
npm install

# 환경 변수 설정
Copy-Item .env.local.example .env.local
# 또는 수동으로 .env.local 파일 생성

# 개발 서버 실행
npm run dev
```

## 🔒 보안 주의사항

1. **환경 변수 파일 (.env, .env.local)**
   - API 키, 데이터베이스 비밀번호 등이 포함되어 있음
   - 백업 파일을 공유할 때는 반드시 제거하세요
   - 안전한 곳에 별도 보관하세요

2. **node_modules 폴더**
   - 백업하지 않아도 됨 (npm install로 재설치 가능)
   - 용량이 크므로 제외하는 것이 좋음

3. **Git 히스토리**
   - .git 폴더는 백업하지 않음
   - Git 저장소가 있다면 별도로 관리하세요

## 📋 백업 체크리스트

- [ ] 핵심 소스 코드 (app, components, lib, hooks, types, constants, utils)
- [ ] 정적 파일 (public 폴더)
- [ ] API 라우트 (pages/api 폴더)
- [ ] 설정 파일 (package.json, next.config.*, tsconfig.json 등)
- [ ] 배포 설정 (netlify.toml, vercel.json)
- [ ] 문서 파일 (README.md, *.md, *.sql)
- [ ] 환경 변수 파일 (.env.local, .env) - 보안 주의
- [ ] 압축 파일 생성
- [ ] 백업 정보 파일 생성

## 🎯 권장 백업 주기

- **개발 중**: 주요 기능 완성 후마다
- **배포 전**: 프로덕션 배포 전 반드시
- **정기적**: 주 1회 또는 월 1회
- **중요 업데이트**: 고도화 작업 완료 후

---

*이 문서는 WellSwap 프로젝트 백업을 위한 가이드입니다.*
*백업 파일은 안전한 곳에 보관하고, 환경 변수는 별도 관리하세요.*
