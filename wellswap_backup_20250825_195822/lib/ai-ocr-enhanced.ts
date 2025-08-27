// Enhanced OCR System with Multi-Validation & Accuracy Improvement
// 고도화된 OCR 시스템 - 다중 검증 및 정확도 향상

interface OCRDocument {
  id: string;
  type: 'insurance_policy' | 'certificate' | 'statement' | 'contract';
  language: 'en' | 'ko' | 'zh' | 'ja';
  content: string;
  confidence: number;
  extractedData: ExtractedInsuranceData;
  validationResults: ValidationResult[];
  corrections: Correction[];
  processingTime: number;
}

interface ExtractedInsuranceData {
  // 기본 정보
  policyNumber?: string;
  insuredName?: string;
  issueDate?: string;
  maturityDate?: string;
  premiumAmount?: number;
  currency?: string;
  
  // 상품 정보
  productName?: string;
  productType?: string;
  companyName?: string;
  
  // 금융 정보
  surrenderValue?: number;
  cashValue?: number;
  deathBenefit?: number;
  annualPremium?: number;
  totalPremium?: number;
  
  // 계약 정보
  contractPeriod?: number;
  paymentFrequency?: string;
  riders?: string[];
  exclusions?: string[];
  
  // 부동산 관련 (해당하는 경우)
  propertyAddress?: string;
  propertyValue?: number;
  rentalIncome?: number;
  
  // 메타데이터
  documentType?: string;
  pageCount?: number;
  scanQuality?: number;
}

interface ValidationResult {
  field: string;
  isValid: boolean;
  confidence: number;
  errors: string[];
  suggestions: string[];
}

interface Correction {
  field: string;
  originalValue: string;
  correctedValue: string;
  confidence: number;
  reason: string;
}

interface OCRProcessingOptions {
  language: 'en' | 'ko' | 'zh' | 'ja';
  documentType: 'insurance_policy' | 'certificate' | 'statement' | 'contract';
  enableValidation: boolean;
  enableCorrection: boolean;
  enableRealEstateDetection: boolean;
  qualityThreshold: number;
  maxRetries: number;
}

export class EnhancedOCRSystem {
  private readonly TESSERACT_CONFIG = {
    lang: 'eng+kor+chi_sim+jpn',
    oem: 1,
    psm: 3,
    dpi: 300
  };
  
  private readonly VALIDATION_RULES = {
    policyNumber: /^[A-Z0-9]{8,20}$/,
    date: /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
    currency: /^[A-Z]{3}$/,
    amount: /^\d+(\.\d{1,2})?$/
  };
  
  private readonly COMPANY_PATTERNS = {
    'AIA': /AIA|American International Assurance/i,
    'Prudential': /Prudential|Prudential plc/i,
    'Manulife': /Manulife|Manulife Financial/i,
    'Great Eastern': /Great Eastern|Great Eastern Life/i,
    'FWD': /FWD|FWD Insurance/i,
    'Sun Life': /Sun Life|Sun Life Financial/i
  };
  
  private readonly PRODUCT_PATTERNS = {
    'Life Insurance': /Life Insurance|Term Life|Whole Life/i,
    'Savings Plan': /Savings Plan|Savings Insurance/i,
    'Pension Plan': /Pension Plan|Retirement Plan/i,
    'Investment Linked': /Investment Linked|ILP/i,
    'Medical Insurance': /Medical Insurance|Health Insurance/i,
    'Endowment Plan': /Endowment Plan|Endowment Insurance/i
  };

  constructor() {
    this.initializeOCR();
  }

  // 고도화된 OCR 처리
  async processDocument(
    file: File | string, 
    options: OCRProcessingOptions
  ): Promise<OCRDocument> {
    const startTime = Date.now();
    console.log('🚀 고도화된 OCR 처리 시작:', options);

    try {
      // 1단계: 이미지 전처리
      const preprocessedImage = await this.preprocessImage(file);
      
      // 2단계: 다중 OCR 엔진 처리
      const ocrResults = await this.runMultipleOCREngines(preprocessedImage, options);
      
      // 3단계: 텍스트 추출 및 정리
      const extractedText = this.extractAndCleanText(ocrResults);
      
      // 4단계: 보험 데이터 추출
      const extractedData = await this.extractInsuranceData(extractedText, options);
      
      // 5단계: 데이터 검증
      const validationResults = options.enableValidation ? 
        await this.validateExtractedData(extractedData) : [];
      
      // 6단계: 자동 보정
      const corrections = options.enableCorrection ? 
        await this.correctExtractedData(extractedData, validationResults) : [];
      
      // 7단계: 금융부동산 정보 감지 (해당하는 경우)
      if (options.enableRealEstateDetection) {
        await this.detectRealEstateInformation(extractedData, extractedText);
      }
      
      // 8단계: 신뢰도 계산
      const confidence = this.calculateOverallConfidence(ocrResults, validationResults, corrections);
      
      // 9단계: 결과 생성
      const document: OCRDocument = {
        id: this.generateDocumentId(),
        type: options.documentType,
        language: options.language,
        content: extractedText,
        confidence,
        extractedData,
        validationResults,
        corrections,
        processingTime: Date.now() - startTime
      };

      console.log('✅ 고도화된 OCR 처리 완료:', document);
      return document;

    } catch (error) {
      console.error('❌ OCR 처리 오류:', error);
      throw new Error(`Enhanced OCR processing failed: ${error.message}`);
    }
  }

  // 이미지 전처리
  private async preprocessImage(file: File | string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 캔버스 크기 설정
        canvas.width = img.width;
        canvas.height = img.height;

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0);

        // 이미지 품질 개선
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          // 노이즈 제거
          this.removeNoise(imageData);
          
          // 대비 향상
          this.enhanceContrast(imageData);
          
          // 선명도 개선
          this.sharpenImage(imageData);
          
          ctx.putImageData(imageData, 0, 0);
        }

        // 처리된 이미지를 base64로 변환
        const processedImage = canvas.toDataURL('image/png', 0.9);
        resolve(processedImage);
      };

      img.onerror = () => reject(new Error('Image loading failed'));

      if (typeof file === 'string') {
        img.src = file;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 다중 OCR 엔진 실행
  private async runMultipleOCREngines(
    image: string, 
    options: OCRProcessingOptions
  ): Promise<any[]> {
    const engines = [
      this.runTesseractOCR,
      this.runCloudVisionOCR,
      this.runCustomAIOCR
    ];

    const results = await Promise.allSettled(
      engines.map(engine => engine(image, options))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
  }

  // Tesseract OCR 실행
  private async runTesseractOCR(image: string, options: OCRProcessingOptions): Promise<any> {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      
      await worker.loadLanguage(options.language);
      await worker.initialize(options.language);
      
      const result = await worker.recognize(image, this.TESSERACT_CONFIG);
      await worker.terminate();
      
      return {
        engine: 'tesseract',
        text: result.data.text,
        confidence: result.data.confidence / 100,
        words: result.data.words
      };
    } catch (error) {
      console.warn('Tesseract OCR failed:', error);
      return null;
    }
  }

  // Google Cloud Vision OCR 실행
  private async runCloudVisionOCR(image: string, options: OCRProcessingOptions): Promise<any> {
    try {
      // Cloud Vision API 호출 (실제 구현 시 API 키 필요)
      const response = await fetch('/api/cloud-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, language: options.language })
      });

      if (!response.ok) throw new Error('Cloud Vision API failed');
      
      const result = await response.json();
      return {
        engine: 'cloud-vision',
        text: result.text,
        confidence: result.confidence,
        words: result.words
      };
    } catch (error) {
      console.warn('Cloud Vision OCR failed:', error);
      return null;
    }
  }

  // 커스텀 AI OCR 실행
  private async runCustomAIOCR(image: string, options: OCRProcessingOptions): Promise<any> {
    try {
      const response = await fetch('https://wellswaphk.onrender.com/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image, 
          language: options.language,
          documentType: options.documentType 
        })
      });

      if (!response.ok) throw new Error('Custom AI OCR failed');
      
      const result = await response.json();
      return {
        engine: 'custom-ai',
        text: result.text,
        confidence: result.confidence,
        words: result.words,
        extractedData: result.extractedData
      };
    } catch (error) {
      console.warn('Custom AI OCR failed:', error);
      return null;
    }
  }

  // 텍스트 추출 및 정리
  private extractAndCleanText(ocrResults: any[]): string {
    // 모든 OCR 결과에서 텍스트 추출
    const allTexts = ocrResults
      .filter(result => result && result.text)
      .map(result => result.text);

    if (allTexts.length === 0) {
      throw new Error('No text extracted from OCR results');
    }

    // 텍스트 통합 및 정리
    let combinedText = allTexts.join('\n');
    
    // 불필요한 공백 제거
    combinedText = combinedText.replace(/\s+/g, ' ').trim();
    
    // 특수 문자 정리
    combinedText = this.cleanSpecialCharacters(combinedText);
    
    // 줄바꿈 정리
    combinedText = this.normalizeLineBreaks(combinedText);

    return combinedText;
  }

  // 보험 데이터 추출
  private async extractInsuranceData(
    text: string, 
    options: OCRProcessingOptions
  ): Promise<ExtractedInsuranceData> {
    const extractedData: ExtractedInsuranceData = {};

    // 정책번호 추출
    extractedData.policyNumber = this.extractPolicyNumber(text);
    
    // 보험사명 추출
    extractedData.companyName = this.extractCompanyName(text);
    
    // 상품명 추출
    extractedData.productName = this.extractProductName(text);
    
    // 상품 유형 추출
    extractedData.productType = this.extractProductType(text);
    
    // 날짜 정보 추출
    extractedData.issueDate = this.extractDate(text, 'issue');
    extractedData.maturityDate = this.extractDate(text, 'maturity');
    
    // 금액 정보 추출
    extractedData.premiumAmount = this.extractAmount(text, 'premium');
    extractedData.surrenderValue = this.extractAmount(text, 'surrender');
    extractedData.cashValue = this.extractAmount(text, 'cash');
    extractedData.deathBenefit = this.extractAmount(text, 'death');
    
    // 통화 추출
    extractedData.currency = this.extractCurrency(text);
    
    // 계약 기간 추출
    extractedData.contractPeriod = this.extractContractPeriod(text);
    
    // 납입 주기 추출
    extractedData.paymentFrequency = this.extractPaymentFrequency(text);
    
    // 특약 및 제외사항 추출
    extractedData.riders = this.extractRiders(text);
    extractedData.exclusions = this.extractExclusions(text);

    return extractedData;
  }

  // 데이터 검증
  private async validateExtractedData(data: ExtractedInsuranceData): Promise<ValidationResult[]> {
    const validationResults: ValidationResult[] = [];

    // 정책번호 검증
    validationResults.push(this.validatePolicyNumber(data.policyNumber));
    
    // 날짜 검증
    validationResults.push(this.validateDate(data.issueDate, 'issueDate'));
    validationResults.push(this.validateDate(data.maturityDate, 'maturityDate'));
    
    // 금액 검증
    validationResults.push(this.validateAmount(data.premiumAmount, 'premiumAmount'));
    validationResults.push(this.validateAmount(data.surrenderValue, 'surrenderValue'));
    
    // 통화 검증
    validationResults.push(this.validateCurrency(data.currency));
    
    // 회사명 검증
    validationResults.push(this.validateCompanyName(data.companyName));

    return validationResults;
  }

  // 자동 보정
  private async correctExtractedData(
    data: ExtractedInsuranceData, 
    validationResults: ValidationResult[]
  ): Promise<Correction[]> {
    const corrections: Correction[] = [];

    // 검증 실패한 필드들에 대해 보정 시도
    for (const validation of validationResults) {
      if (!validation.isValid) {
        const correction = await this.attemptCorrection(validation.field, data[validation.field as keyof ExtractedInsuranceData]);
        if (correction) {
          corrections.push(correction);
        }
      }
    }

    return corrections;
  }

  // 금융부동산 정보 감지
  private async detectRealEstateInformation(
    data: ExtractedInsuranceData, 
    text: string
  ): Promise<void> {
    // 부동산 관련 키워드 검색
    const realEstateKeywords = [
      'property', 'real estate', 'building', 'apartment', 'house',
      'rental', 'lease', 'mortgage', 'land', 'commercial'
    ];

    const hasRealEstateContent = realEstateKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasRealEstateContent) {
      // 부동산 주소 추출
      data.propertyAddress = this.extractPropertyAddress(text);
      
      // 부동산 가치 추출
      data.propertyValue = this.extractAmount(text, 'property');
      
      // 임대 수익 추출
      data.rentalIncome = this.extractAmount(text, 'rental');
    }
  }

  // 이미지 품질 개선 메서드들
  private removeNoise(imageData: ImageData): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // 중간값 필터 적용
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(data[nIdx]);
          }
        }
        
        neighbors.sort((a, b) => a - b);
        const median = neighbors[4]; // 중간값
        
        data[idx] = median;
        data[idx + 1] = median;
        data[idx + 2] = median;
      }
    }
  }

  private enhanceContrast(imageData: ImageData): void {
    const data = imageData.data;
    
    // 히스토그램 평활화
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      histogram[gray]++;
    }
    
    // 누적 분포 함수 계산
    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    // 정규화
    const totalPixels = data.length / 4;
    for (let i = 0; i < 256; i++) {
      cdf[i] = Math.round((cdf[i] / totalPixels) * 255);
    }
    
    // 픽셀 값 변환
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      const newValue = cdf[gray];
      data[i] = newValue;
      data[i + 1] = newValue;
      data[i + 2] = newValue;
    }
  }

  private sharpenImage(imageData: ImageData): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(data);

    // 언샤프 마스크 필터
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[ky + 1][kx + 1];
            
            r += tempData[nIdx] * weight;
            g += tempData[nIdx + 1] * weight;
            b += tempData[nIdx + 2] * weight;
          }
        }
        
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
  }

  // 텍스트 정리 메서드들
  private cleanSpecialCharacters(text: string): string {
    return text
      .replace(/[^\w\s\-.,$%()]/g, ' ') // 특수문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 제거
      .trim();
  }

  private normalizeLineBreaks(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
  }

  // 데이터 추출 메서드들
  private extractPolicyNumber(text: string): string | undefined {
    const patterns = [
      /Policy\s*(?:No|Number|#)?\s*:?\s*([A-Z0-9]{8,20})/i,
      /(?:Policy|Contract)\s*([A-Z0-9]{8,20})/i,
      /([A-Z]{2,4}\d{6,12})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractCompanyName(text: string): string | undefined {
    for (const [company, pattern] of Object.entries(this.COMPANY_PATTERNS)) {
      if (pattern.test(text)) {
        return company;
      }
    }
    return undefined;
  }

  private extractProductName(text: string): string | undefined {
    const patterns = [
      /Product\s*:?\s*([^\n\r]+)/i,
      /Plan\s*:?\s*([^\n\r]+)/i,
      /Policy\s*:?\s*([^\n\r]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractProductType(text: string): string | undefined {
    for (const [type, pattern] of Object.entries(this.PRODUCT_PATTERNS)) {
      if (pattern.test(text)) {
        return type;
      }
    }
    return undefined;
  }

  private extractDate(text: string, type: 'issue' | 'maturity'): string | undefined {
    const patterns = [
      new RegExp(`${type}\\s*(?:date|on)?\\s*:?\\s*(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})`, 'i'),
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractAmount(text: string, type: string): number | undefined {
    const patterns = [
      new RegExp(`${type}\\s*(?:amount|value|premium)?\\s*:?\\s*[\\$]?([\\d,]+(?:\\.\\d{2})?)`, 'i'),
      /[\$]?([\d,]+(?:\.\d{2})?)\s*(?:USD|HKD|SGD)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return undefined;
  }

  private extractCurrency(text: string): string | undefined {
    const patterns = [
      /(USD|HKD|SGD|EUR|JPY|CNY)/i,
      /[\$]?\d+(?:\.\d{2})?\s*(USD|HKD|SGD|EUR|JPY|CNY)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].toUpperCase();
    }
    return 'USD'; // 기본값
  }

  // 검증 메서드들
  private validatePolicyNumber(policyNumber?: string): ValidationResult {
    const isValid = policyNumber ? this.VALIDATION_RULES.policyNumber.test(policyNumber) : false;
    return {
      field: 'policyNumber',
      isValid,
      confidence: isValid ? 0.9 : 0.1,
      errors: isValid ? [] : ['Invalid policy number format'],
      suggestions: isValid ? [] : ['Check policy number format (8-20 alphanumeric characters)']
    };
  }

  private validateDate(date?: string, fieldName: string): ValidationResult {
    const isValid = date ? this.VALIDATION_RULES.date.test(date) : false;
    return {
      field: fieldName,
      isValid,
      confidence: isValid ? 0.8 : 0.2,
      errors: isValid ? [] : ['Invalid date format'],
      suggestions: isValid ? [] : ['Use YYYY-MM-DD or YYYY/MM/DD format']
    };
  }

  private validateAmount(amount?: number, fieldName: string): ValidationResult {
    const isValid = amount !== undefined && amount > 0;
    return {
      field: fieldName,
      isValid,
      confidence: isValid ? 0.9 : 0.1,
      errors: isValid ? [] : ['Invalid amount'],
      suggestions: isValid ? [] : ['Amount must be positive number']
    };
  }

  private validateCurrency(currency?: string): ValidationResult {
    const isValid = currency ? this.VALIDATION_RULES.currency.test(currency) : false;
    return {
      field: 'currency',
      isValid,
      confidence: isValid ? 0.9 : 0.1,
      errors: isValid ? [] : ['Invalid currency code'],
      suggestions: isValid ? [] : ['Use 3-letter currency code (USD, HKD, SGD, etc.)']
    };
  }

  private validateCompanyName(companyName?: string): ValidationResult {
    const isValid = companyName && Object.keys(this.COMPANY_PATTERNS).includes(companyName);
    return {
      field: 'companyName',
      isValid,
      confidence: isValid ? 0.8 : 0.3,
      errors: isValid ? [] : ['Unknown insurance company'],
      suggestions: isValid ? [] : ['Check company name spelling']
    };
  }

  // 보정 메서드들
  private async attemptCorrection(field: string, value: any): Promise<Correction | null> {
    // AI 서버를 통한 보정 시도
    try {
      const response = await fetch('https://wellswaphk.onrender.com/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          field,
          originalValue: value,
          correctedValue: result.correctedValue,
          confidence: result.confidence,
          reason: result.reason
        };
      }
    } catch (error) {
      console.warn('Correction attempt failed:', error);
    }

    return null;
  }

  // 유틸리티 메서드들
  private calculateOverallConfidence(
    ocrResults: any[], 
    validationResults: ValidationResult[], 
    corrections: Correction[]
  ): number {
    // OCR 결과 신뢰도 평균
    const ocrConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length;
    
    // 검증 결과 신뢰도 평균
    const validationConfidence = validationResults.reduce((sum, result) => sum + result.confidence, 0) / validationResults.length;
    
    // 보정 신뢰도 평균
    const correctionConfidence = corrections.length > 0 ? 
      corrections.reduce((sum, correction) => sum + correction.confidence, 0) / corrections.length : 1;
    
    // 가중 평균 계산
    return (ocrConfidence * 0.5 + validationConfidence * 0.3 + correctionConfidence * 0.2);
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeOCR(): void {
    // OCR 초기화 로직
    console.log('🔧 Enhanced OCR System initialized');
  }

  // 기타 추출 메서드들 (구현 생략)
  private extractContractPeriod(text: string): number | undefined { return undefined; }
  private extractPaymentFrequency(text: string): string | undefined { return undefined; }
  private extractRiders(text: string): string[] { return []; }
  private extractExclusions(text: string): string[] { return []; }
  private extractPropertyAddress(text: string): string | undefined { return undefined; }
}

export default EnhancedOCRSystem;

