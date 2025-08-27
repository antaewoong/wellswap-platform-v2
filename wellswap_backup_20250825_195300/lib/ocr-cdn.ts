// lib/ocr-cdn.ts - CDN 기반 OCR 서비스 (npm 설치 불필요)

export class OCRCDNService {
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  // Tesseract.js CDN 동적 로드
  private static async loadTesseract(): Promise<any> {
    if (this.isLoaded) {
      return (window as any).Tesseract;
    }

    if (this.loadPromise) {
      await this.loadPromise;
      return (window as any).Tesseract;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js';
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await this.loadPromise;
    return (window as any).Tesseract;
  }

  // 이미지에서 텍스트 추출
  static async extractTextFromImage(file: File): Promise<{
    success: boolean;
    rawText: string;
    confidence: number;
    processingTime: number;
    extractedData: any;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Loading Tesseract.js from CDN...');
      const Tesseract = await this.loadTesseract();
      
      console.log('🔄 Creating OCR worker...');
      const { createWorker } = Tesseract;
      const worker = await createWorker();
      
      console.log('🔄 Loading language models...');
      await worker.loadLanguage('eng+chi_tra');
      await worker.initialize('eng+chi_tra');
      
      console.log('🔄 Processing image...');
      const result = await worker.recognize(file);
      await worker.terminate();
      
      const processingTime = Date.now() - startTime;
      const rawText = result.data.text;
      const confidence = result.data.confidence / 100;
      
      console.log('✅ OCR completed:', {
        processingTime: `${processingTime}ms`,
        confidence: `${(confidence * 100).toFixed(1)}%`,
        textLength: rawText.length
      });
      
      // 보험 데이터 파싱
      const extractedData = this.parseInsuranceData(rawText);
      
      return {
        success: true,
        rawText,
        confidence,
        processingTime,
        extractedData
      };
      
    } catch (error) {
      console.error('❌ OCR processing error:', error);
      
      // 백업: 기본 파일 정보 기반 목업 데이터
      const mockData = this.generateMockData(file);
      
      return {
        success: false,
        rawText: '',
        confidence: 0,
        processingTime: Date.now() - startTime,
        extractedData: mockData
      };
    }
  }

  // 보험 데이터 파싱 로직
  private static parseInsuranceData(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // 홍콩 보험 회사 패턴
    const companyPatterns = [
      { pattern: /AIA[\s\w]*Hong Kong/i, name: "AIA Hong Kong" },
      { pattern: /Prudential[\s\w]*Hong Kong/i, name: "Prudential Hong Kong" },
      { pattern: /Manulife[\s\w]*Hong Kong/i, name: "Manulife Hong Kong" },
      { pattern: /FWD[\s\w]*Insurance/i, name: "FWD Insurance" },
      { pattern: /Great Eastern/i, name: "Great Eastern" },
      { pattern: /Zurich[\s\w]*International/i, name: "Zurich International Life" },
      { pattern: /HSBC[\s\w]*Life/i, name: "HSBC Life" },
      { pattern: /Standard Life/i, name: "Standard Life" },
      { pattern: /Sun Life/i, name: "Sun Life Hong Kong" }
    ];
    
    // 회사명 추출
    let company = '';
    for (const { pattern, name } of companyPatterns) {
      if (pattern.test(text)) {
        company = name;
        break;
      }
    }
    
    // 정책 번호 추출
    const policyNumberPatterns = [
      /Policy[\s\w]*No[:\s]*([A-Z0-9]{6,20})/i,
      /保單號碼[:\s]*([A-Z0-9]{6,20})/i,
      /([A-Z]{2,3}[0-9]{6,15})/,
      /([0-9]{8,15})/
    ];
    
    let policyNumber = '';
    for (const pattern of policyNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        policyNumber = match[1] || match[0];
        break;
      }
    }
    
    // 날짜 추출 (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
    const datePatterns = [
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/g
    ];
    
    const dates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    }
    
    // 금액 추출
    const amountPatterns = [
      /\$[\d,]+\.?\d*/g,
      /USD[\s]*[\d,]+\.?\d*/g,
      /HKD[\s]*[\d,]+\.?\d*/g,
      /[\d,]+\.?\d*[\s]*USD/g
    ];
    
    const amounts: string[] = [];
    for (const pattern of amountPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        amounts.push(...matches);
      }
    }
    
    // 상품명 추출 (보통 회사명 근처에 있음)
    const productPatterns = [
      /Premier[\s\w]*Treasure/i,
      /Wealth[\s\w]*Builder/i,
      /Future[\s\w]*Protector/i,
      /SmartLife[\s\w]*Plan/i,
      /Elite[\s\w]*Series/i
    ];
    
    let productName = '';
    for (const pattern of productPatterns) {
      const match = text.match(pattern);
      if (match) {
        productName = match[0];
        break;
      }
    }
    
    // 추출된 데이터 정리
    const extractedData = {
      company: company || 'Unknown Company',
      productName: productName || 'Insurance Product',
      policyNumber: policyNumber || this.generatePolicyNumber(),
      originalValue: amounts[0] || '$100,000',
      premiumAmount: amounts[1] || amounts[0] || '$5,000',
      purchaseDate: this.formatDate(dates[0]) || '',
      maturityDate: this.formatDate(dates[1]) || '',
      currency: this.detectCurrency(text),
      location: 'Hong Kong'
    };
    
    console.log('📊 Parsed insurance data:', extractedData);
    return extractedData;
  }

  // 통화 감지
  private static detectCurrency(text: string): string {
    if (/USD|US\$|\$USD/i.test(text)) return 'USD';
    if (/HKD|HK\$|\$HKD/i.test(text)) return 'HKD';
    if (/EUR|€/i.test(text)) return 'EUR';
    if (/GBP|£/i.test(text)) return 'GBP';
    return 'USD'; // 기본값
  }

  // 날짜 형식 정리
  private static formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      // DD/MM/YYYY를 YYYY-MM-DD로 변환
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // DD-MM-YYYY를 YYYY-MM-DD로 변환
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // 이미 YYYY-MM-DD 형식이면 그대로 반환
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        return dateStr;
      }
      
      return dateStr;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateStr;
    }
  }

  // 정책 번호 생성
  private static generatePolicyNumber(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let policyNumber = '';
    
    // 2-3자리 알파벳
    for (let i = 0; i < 3; i++) {
      policyNumber += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 8-10자리 숫자
    for (let i = 0; i < 9; i++) {
      policyNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return policyNumber;
  }

  // 백업용 목업 데이터 생성
  private static generateMockData(file: File): any {
    const companies = [
      "AIA Hong Kong",
      "Prudential Hong Kong", 
      "Manulife Hong Kong",
      "FWD Insurance"
    ];
    
    const products = [
      "Premier Treasure Plan",
      "Wealth Builder Series",
      "Future Protector",
      "SmartLife Plan"
    ];
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    return {
      company: randomCompany,
      productName: randomProduct,
      policyNumber: this.generatePolicyNumber(),
      originalValue: '$100,000',
      premiumAmount: '$5,000',
      purchaseDate: '2023-01-15',
      maturityDate: '2033-01-15',
      currency: 'USD',
      location: 'Hong Kong'
    };
  }
}

// Hugging Face AI 분석 서비스 (선택사항)
export class HuggingFaceOCRService {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models/microsoft/trocr-base-printed';
  private static readonly API_TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN || '';

  static async analyzeImage(file: File): Promise<any> {
    if (!this.API_TOKEN) {
      console.warn('⚠️ Hugging Face token not found, using fallback');
      return null;
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤗 Hugging Face result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Hugging Face API error:', error);
      return null;
    }
  }
}
