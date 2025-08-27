# Google OAuth 2.0 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `WellSwap OAuth`

### 1.2 OAuth 동의 화면 설정
1. **API 및 서비스** > **OAuth 동의 화면** 이동
2. 사용자 유형: **외부** 선택
3. 앱 정보 입력:
   - 앱 이름: `WellSwap`
   - 사용자 지원 이메일: `your-email@gmail.com`
   - 개발자 연락처 정보: `your-email@gmail.com`

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. **API 및 서비스** > **사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기** > **OAuth 2.0 클라이언트 ID** 클릭
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름: `WellSwap Web Client`
5. 승인된 리디렉션 URI 추가:
   ```
   http://localhost:3000/api/auth/google/callback
   https://your-domain.com/api/auth/google/callback
   ```

### 1.4 클라이언트 ID 및 시크릿 복사
- **클라이언트 ID**: `your_google_client_id_here` 부분에 복사
- **클라이언트 시크릿**: `your_google_client_secret_here` 부분에 복사

## 2. 환경 변수 설정

### 2.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Web3 Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_NETWORK_ID=your_network_id_here

# AI Server Configuration
NEXT_PUBLIC_AI_SERVER_URL=your_ai_server_url_here
```

### 2.2 실제 값으로 교체
- `your_google_client_id_here` → Google Cloud Console에서 받은 클라이언트 ID
- `your_google_client_secret_here` → Google Cloud Console에서 받은 클라이언트 시크릿
- `your_supabase_url_here` → Supabase 프로젝트 URL
- `your_supabase_anon_key_here` → Supabase 익명 키

## 3. 테스트 방법

### 3.1 개발 서버 실행
```bash
npm run dev
```

### 3.2 Gmail 로그인 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. 상단 네비게이션의 "Sign in with Gmail" 버튼 클릭
3. Google 계정으로 로그인
4. 인증 완료 후 WellSwap으로 리디렉션 확인

### 3.3 언어 선택 테스트
1. 상단 네비게이션의 언어 선택 드롭다운 클릭
2. 각 언어 옵션 선택하여 UI 변경 확인

### 3.4 구매페이지 멀티시그 테스트
1. "BUY" 페이지로 이동
2. 지갑 연결 상태 확인
3. "Connect Wallet" 버튼으로 지갑 연결
4. "Purchase with Multisig" 버튼으로 구매 진행

## 4. 문제 해결

### 4.1 OAuth 오류
- **"redirect_uri_mismatch"**: 승인된 리디렉션 URI 확인
- **"invalid_client"**: 클라이언트 ID/시크릿 확인
- **"access_denied"**: OAuth 동의 화면 설정 확인

### 4.2 환경 변수 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인
- 개발 서버 재시작

### 4.3 CORS 오류
- Google Cloud Console에서 승인된 도메인 추가
- 개발 환경: `http://localhost:3000`
- 프로덕션 환경: `https://your-domain.com`
