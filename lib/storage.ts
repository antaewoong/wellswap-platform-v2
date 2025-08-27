// lib/storage.ts - Complete File Storage Service
import { supabase, log, WellSwapError, validateFileType, validateFileSize, PLATFORM_CONFIG } from './supabase'

export interface UploadResult {
  path: string
  publicUrl: string
  fileName: string
  fileSize: number
  fileType: string
}

export interface DocumentData {
  id: string
  product_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  upload_date: string
  ocr_text?: string
  is_processed: boolean
}

export class StorageService {
  private static readonly BUCKET_NAME = 'insurance-documents'

  // 파일 업로드
  static async uploadFile(file: File, productId?: string): Promise<UploadResult> {
    try {
      // 파일 유효성 검사
      if (!validateFileType(file)) {
        throw new WellSwapError(
          `Unsupported file type. Supported types: ${PLATFORM_CONFIG.SUPPORTED_FILE_TYPES.join(', ')}`,
          'INVALID_FILE_TYPE'
        )
      }

      if (!validateFileSize(file)) {
        throw new WellSwapError(
          `File too large. Maximum size: ${PLATFORM_CONFIG.MAX_FILE_SIZE_MB}MB`,
          'FILE_TOO_LARGE'
        )
      }

      // 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      // 파일 경로 생성
      const fileName = this.generateFileName(file.name)
      const filePath = this.generateFilePath(user.id, fileName)

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        log.error('File upload error:', error)
        throw new WellSwapError(error.message, 'UPLOAD_ERROR', error)
      }

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      // 데이터베이스에 문서 정보 저장
      if (productId) {
        await this.saveDocumentRecord({
          product_id: productId,
          file_name: fileName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size
        })
      }

      log.info('File uploaded successfully:', filePath)

      return {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type
      }
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('File upload failed', 'UPLOAD_FAILED', error)
    }
  }

  // 다중 파일 업로드
  static async uploadMultipleFiles(files: File[], productId?: string): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, productId))
      const results = await Promise.all(uploadPromises)
      
      log.info('Multiple files uploaded successfully:', results.length)
      return results
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Multiple file upload failed', 'MULTIPLE_UPLOAD_FAILED', error)
    }
  }

  // 파일 삭제
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        log.error('File delete error:', error)
        throw new WellSwapError(error.message, 'DELETE_ERROR', error)
      }

      // 데이터베이스에서 문서 기록 삭제
      await supabase
        .from('documents')
        .delete()
        .eq('file_path', filePath)

      log.info('File deleted successfully:', filePath)
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('File deletion failed', 'DELETE_FAILED', error)
    }
  }

  // 파일 다운로드 URL 생성
  static async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        log.error('Get download URL error:', error)
        throw new WellSwapError(error.message, 'URL_GENERATION_ERROR', error)
      }

      return data.signedUrl
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('URL generation failed', 'URL_GENERATION_FAILED', error)
    }
  }

  // 공개 URL 가져오기
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // 문서 기록 저장
  static async saveDocumentRecord(documentData: {
    product_id: string
    file_name: string
    file_path: string
    file_type: string
    file_size: number
    ocr_text?: string
  }): Promise<DocumentData> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          product_id: documentData.product_id,
          file_name: documentData.file_name,
          file_path: documentData.file_path,
          file_type: documentData.file_type,
          file_size: documentData.file_size,
          ocr_text: documentData.ocr_text,
          is_processed: false
        })
        .select()
        .single()

      if (error) {
        log.error('Save document record error:', error)
        throw new WellSwapError(error.message, 'DOCUMENT_SAVE_ERROR', error)
      }

      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Document record save failed', 'DOCUMENT_SAVE_FAILED', error)
    }
  }

  // OCR 텍스트 업데이트
  static async updateOCRText(documentId: string, ocrText: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          ocr_text: ocrText,
          is_processed: true
        })
        .eq('id', documentId)

      if (error) {
        log.error('Update OCR text error:', error)
        throw new WellSwapError(error.message, 'OCR_UPDATE_ERROR', error)
      }

      log.info('OCR text updated successfully:', documentId)
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('OCR text update failed', 'OCR_UPDATE_FAILED', error)
    }
  }

  // 상품의 문서 목록 가져오기
  static async getProductDocuments(productId: string): Promise<DocumentData[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('product_id', productId)
        .order('upload_date', { ascending: false })

      if (error) {
        log.error('Get product documents error:', error)
        throw new WellSwapError(error.message, 'DOCUMENTS_FETCH_ERROR', error)
      }

      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch product documents', 'DOCUMENTS_FETCH_FAILED', error)
    }
  }

  // 사용자의 모든 문서 가져오기
  static async getUserDocuments(): Promise<DocumentData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          insurance_products!inner(
            owner_id
          )
        `)
        .eq('insurance_products.owner_id', user.id)
        .order('upload_date', { ascending: false })

      if (error) {
        log.error('Get user documents error:', error)
        throw new WellSwapError(error.message, 'USER_DOCUMENTS_FETCH_ERROR', error)
      }

      return data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        file_name: item.file_name,
        file_path: item.file_path,
        file_type: item.file_type,
        file_size: item.file_size,
        upload_date: item.upload_date,
        ocr_text: item.ocr_text,
        is_processed: item.is_processed
      }))
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch user documents', 'USER_DOCUMENTS_FETCH_FAILED', error)
    }
  }

  // 파일명 생성 (중복 방지)
  private static generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
    
    return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`
  }

  // 파일 경로 생성
  private static generateFilePath(userId: string, fileName: string): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    
    return `${userId}/${year}/${month}/${fileName}`
  }

  // 스토리지 사용량 확인
  static async getStorageUsage(userId?: string): Promise<{
    totalFiles: number
    totalSize: number
    sizeFormatted: string
  }> {
    try {
      let query = supabase.from('documents').select('file_size')

      if (userId) {
        query = query.eq('insurance_products.owner_id', userId)
      }

      const { data, error } = await query

      if (error) {
        log.error('Get storage usage error:', error)
        throw new WellSwapError(error.message, 'STORAGE_USAGE_ERROR', error)
      }

      const totalFiles = data?.length || 0
      const totalSize = data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0

      return {
        totalFiles,
        totalSize,
        sizeFormatted: this.formatFileSize(totalSize)
      }
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to get storage usage', 'STORAGE_USAGE_FAILED', error)
    }
  }

  // 파일 크기 포맷팅
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 이미지 리사이징 (클라이언트 사이드)
  static async resizeImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 비율 계산
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Image resize failed'))
          }
        }, file.type, quality)
      }

      img.onerror = () => reject(new Error('Image load failed'))
      img.src = URL.createObjectURL(file)
    })
  }

  // 버킷 초기화 (관리자용)
  static async initializeBucket(): Promise<void> {
    try {
      // 버킷 생성 (이미 존재하면 무시)
      const { error: bucketError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true,
        allowedMimeTypes: PLATFORM_CONFIG.SUPPORTED_FILE_TYPES,
        fileSizeLimit: PLATFORM_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024
      })

      if (bucketError && !bucketError.message.includes('already exists')) {
        log.error('Create bucket error:', bucketError)
        throw new WellSwapError(bucketError.message, 'BUCKET_CREATE_ERROR', bucketError)
      }

      log.info('Storage bucket initialized successfully')
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Bucket initialization failed', 'BUCKET_INIT_FAILED', error)
    }
  }
}
