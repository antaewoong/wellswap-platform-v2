@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM WellSwap 프로젝트 전체 백업 스크립트 (Windows)
REM 실행 방법: backup-wellswap.bat

echo 🚀 WellSwap 프로젝트 백업 시작...

REM 현재 날짜와 시간으로 백업 폴더명 생성
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_DATE=%dt:~0,8%_%dt:~8,6%"
set "BACKUP_DIR=wellswap_backup_%BACKUP_DATE%"
set "BACKUP_PATH=.\%BACKUP_DIR%"

echo 📁 백업 폴더: %BACKUP_PATH%

REM 백업 폴더 생성
if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

REM 1. 핵심 소스 코드 백업
echo 📦 핵심 소스 코드 백업 중...
if exist "app" (
    if not exist "%BACKUP_PATH%\app" mkdir "%BACKUP_PATH%\app"
    xcopy "app\*" "%BACKUP_PATH%\app\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ app 폴더 백업 실패
)

if exist "components" (
    if not exist "%BACKUP_PATH%\components" mkdir "%BACKUP_PATH%\components"
    xcopy "components\*" "%BACKUP_PATH%\components\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ components 폴더 백업 실패
)

if exist "lib" (
    if not exist "%BACKUP_PATH%\lib" mkdir "%BACKUP_PATH%\lib"
    xcopy "lib\*" "%BACKUP_PATH%\lib\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ lib 폴더 백업 실패
)

if exist "hooks" (
    if not exist "%BACKUP_PATH%\hooks" mkdir "%BACKUP_PATH%\hooks"
    xcopy "hooks\*" "%BACKUP_PATH%\hooks\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ hooks 폴더 백업 실패
)

if exist "types" (
    if not exist "%BACKUP_PATH%\types" mkdir "%BACKUP_PATH%\types"
    xcopy "types\*" "%BACKUP_PATH%\types\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ types 폴더 백업 실패
)

if exist "constants" (
    if not exist "%BACKUP_PATH%\constants" mkdir "%BACKUP_PATH%\constants"
    xcopy "constants\*" "%BACKUP_PATH%\constants\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ constants 폴더 백업 실패
)

if exist "utils" (
    if not exist "%BACKUP_PATH%\utils" mkdir "%BACKUP_PATH%\utils"
    xcopy "utils\*" "%BACKUP_PATH%\utils\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ utils 폴더 백업 실패
)

REM 2. 설정 파일 백업
echo ⚙️ 설정 파일 백업 중...
if exist "package.json" copy "package.json" "%BACKUP_PATH%\" >nul 2>&1
if exist "package-lock.json" copy "package-lock.json" "%BACKUP_PATH%\" >nul 2>&1
if exist "next.config.js" copy "next.config.js" "%BACKUP_PATH%\" >nul 2>&1
if exist "next.config.ts" copy "next.config.ts" "%BACKUP_PATH%\" >nul 2>&1
if exist "tsconfig.json" copy "tsconfig.json" "%BACKUP_PATH%\" >nul 2>&1
if exist "tailwind.config.js" copy "tailwind.config.js" "%BACKUP_PATH%\" >nul 2>&1
if exist "postcss.config.js" copy "postcss.config.js" "%BACKUP_PATH%\" >nul 2>&1
if exist "postcss.config.mjs" copy "postcss.config.mjs" "%BACKUP_PATH%\" >nul 2>&1

REM 3. 배포 설정 파일 백업
echo 🚀 배포 설정 파일 백업 중...
if exist "netlify.toml" copy "netlify.toml" "%BACKUP_PATH%\" >nul 2>&1
if exist "vercel.json" copy "vercel.json" "%BACKUP_PATH%\" >nul 2>&1

REM 4. 정적 파일 백업
echo 🖼️ 정적 파일 백업 중...
if exist "public" (
    if not exist "%BACKUP_PATH%\public" mkdir "%BACKUP_PATH%\public"
    xcopy "public\*" "%BACKUP_PATH%\public\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ public 폴더 백업 실패
)

REM 5. 문서 파일 백업
echo 📄 문서 파일 백업 중...
if exist "README.md" copy "README.md" "%BACKUP_PATH%\" >nul 2>&1
for %%f in (*.md) do copy "%%f" "%BACKUP_PATH%\" >nul 2>&1

REM 6. SQL 파일 백업
echo 🗄️ SQL 파일 백업 중...
for %%f in (*.sql) do copy "%%f" "%BACKUP_PATH%\" >nul 2>&1

REM 7. API 라우트 백업
echo 🔗 API 라우트 백업 중...
if exist "pages\api" (
    if not exist "%BACKUP_PATH%\pages\api" mkdir "%BACKUP_PATH%\pages\api"
    xcopy "pages\api\*" "%BACKUP_PATH%\pages\api\" /E /I /Y >nul 2>&1
    if errorlevel 1 echo ⚠️ pages\api 폴더 백업 실패
)

REM 8. 환경 변수 파일 백업 (보안 주의)
echo 🔐 환경 변수 파일 백업 중...
if exist ".env.local" copy ".env.local" "%BACKUP_PATH%\" >nul 2>&1
if exist ".env" copy ".env" "%BACKUP_PATH%\" >nul 2>&1

REM 9. 백업 정보 파일 생성
echo 📋 백업 정보 파일 생성 중...
(
echo WellSwap 프로젝트 백업 정보
echo ============================
echo 백업 일시: %date% %time%
echo 백업 폴더: %BACKUP_PATH%
echo.
echo 백업된 폴더:
echo - app/ ^(Next.js 앱 라우터^)
echo - components/ ^(React 컴포넌트^)
echo - lib/ ^(유틸리티 라이브러리^)
echo - hooks/ ^(React 훅^)
echo - types/ ^(TypeScript 타입 정의^)
echo - constants/ ^(상수 정의^)
echo - utils/ ^(유틸리티 함수^)
echo - public/ ^(정적 파일^)
echo - pages/api/ ^(API 라우트^)
echo.
echo 백업된 설정 파일:
echo - package.json ^(의존성^)
echo - next.config.js/ts ^(Next.js 설정^)
echo - tsconfig.json ^(TypeScript 설정^)
echo - tailwind.config.js ^(Tailwind CSS 설정^)
echo - postcss.config.js/mjs ^(PostCSS 설정^)
echo - netlify.toml ^(Netlify 배포 설정^)
echo - vercel.json ^(Vercel 배포 설정^)
echo.
echo 백업된 문서:
echo - README.md
echo - *.md ^(모든 마크다운 파일^)
echo - *.sql ^(데이터베이스 스키마^)
echo.
echo 주의사항:
echo 1. .env 파일이 포함되어 있으므로 보안에 주의하세요
echo 2. node_modules는 백업하지 않았습니다 ^(npm install로 재설치 가능^)
echo 3. .git 폴더는 백업하지 않았습니다 ^(Git 히스토리는 별도 관리^)
echo.
echo 복원 방법:
echo 1. 새 폴더에 백업 파일들을 복사
echo 2. npm install 실행
echo 3. 환경 변수 설정
echo 4. npm run dev로 개발 서버 실행
) > "%BACKUP_PATH%\backup_info.txt"

REM 10. 압축 파일 생성 (PowerShell 사용)
echo 🗜️ 압축 파일 생성 중...
powershell -command "Compress-Archive -Path '%BACKUP_PATH%' -DestinationPath '%BACKUP_DIR%.zip' -Force" >nul 2>&1
if errorlevel 1 echo ⚠️ 압축 파일 생성 실패

REM 11. 백업 완료 보고서
echo ✅ 백업 완료!
echo.
echo 📊 백업 결과:
echo    📁 백업 폴더: %BACKUP_PATH%
echo    🗜️ 압축 파일: %BACKUP_DIR%.zip
echo    📋 정보 파일: %BACKUP_PATH%\backup_info.txt
echo.
echo 📦 백업된 주요 파일들:
for /r "%BACKUP_PATH%" %%f in (*.ts *.tsx *.js *.jsx) do (
    echo    ✅ %%~nxf
    goto :count_done
)
:count_done
echo    ... ^(총 파일 수 확인 중^)
echo.
echo 🔒 보안 주의사항:
echo    - .env 파일이 포함되어 있으므로 안전한 곳에 보관하세요
echo    - 백업 파일을 공유할 때는 환경 변수를 제거하세요
echo.
echo 🔄 복원 방법:
echo    1. %BACKUP_DIR%.zip 파일을 압축 해제
echo    2. cd %BACKUP_DIR%
echo    3. npm install
echo    4. 환경 변수 설정
echo    5. npm run dev
echo.
echo 🎉 WellSwap 프로젝트 백업이 성공적으로 완료되었습니다!

pause
