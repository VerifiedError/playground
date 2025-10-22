/**
 * File Upload Validation
 *
 * Validates file uploads using both MIME type and magic bytes (file signature).
 * Prevents malicious file uploads disguised as legitimate file types.
 */

import { fileTypeFromBuffer } from 'file-type'

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': { ext: ['.pdf'], maxSize: 10 }, // 10MB
  'text/plain': { ext: ['.txt'], maxSize: 5 }, // 5MB
  'text/markdown': { ext: ['.md'], maxSize: 5 }, // 5MB
  'text/csv': { ext: ['.csv'], maxSize: 10 }, // 10MB
  'application/json': { ext: ['.json'], maxSize: 5 }, // 5MB
  'application/xml': { ext: ['.xml'], maxSize: 5 }, // 5MB
  'text/xml': { ext: ['.xml'], maxSize: 5 }, // 5MB

  // Images (for vision models)
  'image/jpeg': { ext: ['.jpg', '.jpeg'], maxSize: 5 }, // 5MB
  'image/png': { ext: ['.png'], maxSize: 5 }, // 5MB
  'image/gif': { ext: ['.gif'], maxSize: 5 }, // 5MB
  'image/webp': { ext: ['.webp'], maxSize: 5 }, // 5MB
  'image/svg+xml': { ext: ['.svg'], maxSize: 2 }, // 2MB

  // Office documents (read-only)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: ['.docx'], maxSize: 10 }, // 10MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: ['.xlsx'], maxSize: 10 }, // 10MB
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: ['.pptx'], maxSize: 10 }, // 10MB
} as const

/**
 * Maximum file size in bytes (10MB default)
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
  detectedType?: string
  extension?: string
}

/**
 * Validate file type using magic bytes (file signature)
 *
 * This prevents attacks where a malicious file is disguised as a safe file type.
 * For example, an .exe file renamed to .jpg would be detected.
 */
export async function validateFileMagicBytes(
  buffer: Buffer,
  declaredMimeType: string,
  fileName: string
): Promise<FileValidationResult> {
  try {
    // Detect actual file type from magic bytes
    const detectedType = await fileTypeFromBuffer(buffer)

    // For text-based files (txt, md, csv, json, xml), magic bytes detection won't work
    // These files don't have consistent magic bytes, so we trust the MIME type
    const textBasedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
    ]

    if (textBasedTypes.includes(declaredMimeType)) {
      // For text files, just validate the declared MIME type is allowed
      if (!ALLOWED_FILE_TYPES[declaredMimeType as keyof typeof ALLOWED_FILE_TYPES]) {
        return {
          valid: false,
          error: `File type not allowed: ${declaredMimeType}`,
        }
      }

      return {
        valid: true,
        mimeType: declaredMimeType,
        extension: fileName.substring(fileName.lastIndexOf('.')),
      }
    }

    // For binary files (PDF, images, Office docs), validate magic bytes
    if (!detectedType) {
      return {
        valid: false,
        error: 'Unable to detect file type from content. File may be corrupted or empty.',
      }
    }

    // Check if detected type matches declared type
    if (detectedType.mime !== declaredMimeType) {
      return {
        valid: false,
        error: `File type mismatch. Declared: ${declaredMimeType}, Detected: ${detectedType.mime}`,
        mimeType: declaredMimeType,
        detectedType: detectedType.mime,
      }
    }

    // Check if detected type is in allowed list
    if (!ALLOWED_FILE_TYPES[detectedType.mime as keyof typeof ALLOWED_FILE_TYPES]) {
      return {
        valid: false,
        error: `File type not allowed: ${detectedType.mime}`,
        detectedType: detectedType.mime,
      }
    }

    // Validate file extension matches detected type
    const allowedExtensions = ALLOWED_FILE_TYPES[detectedType.mime as keyof typeof ALLOWED_FILE_TYPES].ext
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

    if (!allowedExtensions.includes(fileExt)) {
      return {
        valid: false,
        error: `File extension mismatch. Expected one of ${allowedExtensions.join(', ')}, got ${fileExt}`,
        detectedType: detectedType.mime,
      }
    }

    return {
      valid: true,
      mimeType: detectedType.mime,
      detectedType: detectedType.mime,
      extension: fileExt,
    }
  } catch (error: any) {
    console.error('[File Validation] Error detecting file type:', error)
    return {
      valid: false,
      error: `File validation failed: ${error.message}`,
    }
  }
}

/**
 * Validate file size
 *
 * Checks if file size is within allowed limits for the file type.
 */
export function validateFileSize(
  size: number,
  mimeType: string
): FileValidationResult {
  const typeConfig = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]

  if (!typeConfig) {
    return {
      valid: false,
      error: `Unknown file type: ${mimeType}`,
    }
  }

  const maxSize = typeConfig.maxSize * 1024 * 1024 // Convert MB to bytes

  if (size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit. Maximum ${typeConfig.maxSize}MB, got ${(size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes)',
    }
  }

  return {
    valid: true,
    mimeType,
  }
}

/**
 * Comprehensive file validation
 *
 * Validates:
 * 1. File type is in allowed list
 * 2. File size is within limits
 * 3. Magic bytes match declared MIME type
 * 4. File extension matches detected type
 */
export async function validateUploadedFile(
  buffer: Buffer,
  fileName: string,
  declaredMimeType: string
): Promise<FileValidationResult> {
  // 1. Validate declared MIME type is allowed
  if (!ALLOWED_FILE_TYPES[declaredMimeType as keyof typeof ALLOWED_FILE_TYPES]) {
    return {
      valid: false,
      error: `File type not allowed: ${declaredMimeType}. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
    }
  }

  // 2. Validate file size
  const sizeValidation = validateFileSize(buffer.length, declaredMimeType)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // 3. Validate magic bytes (file signature)
  const magicBytesValidation = await validateFileMagicBytes(
    buffer,
    declaredMimeType,
    fileName
  )
  if (!magicBytesValidation.valid) {
    return magicBytesValidation
  }

  return {
    valid: true,
    mimeType: magicBytesValidation.mimeType,
    detectedType: magicBytesValidation.detectedType,
    extension: magicBytesValidation.extension,
  }
}

/**
 * Check if file is a potential security risk
 *
 * Returns true if file contains dangerous patterns or characteristics.
 */
export function isSecurityRisk(fileName: string, buffer: Buffer): boolean {
  // Check for double extensions (file.pdf.exe)
  const extensionCount = (fileName.match(/\./g) || []).length
  if (extensionCount > 1) {
    const parts = fileName.split('.')
    const lastExt = parts[parts.length - 1].toLowerCase()
    const secondLastExt = parts[parts.length - 2].toLowerCase()

    // Dangerous extensions
    const dangerousExts = ['exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js', 'jar', 'msi', 'dll', 'sh']
    if (dangerousExts.includes(lastExt) || dangerousExts.includes(secondLastExt)) {
      console.warn(`[Security] Blocked double extension: ${fileName}`)
      return true
    }
  }

  // Check for executable signatures in buffer
  const bufferStart = buffer.slice(0, 4).toString('hex')
  const dangerousSignatures = [
    '4d5a9000', // Windows PE executable
    '7f454c46', // ELF executable
    'cafebabe', // Java class file
    '504b0304', // ZIP (could contain executables)
  ]

  for (const signature of dangerousSignatures) {
    if (bufferStart.startsWith(signature.toLowerCase())) {
      console.warn(`[Security] Detected executable signature: ${signature}`)
      return true
    }
  }

  return false
}
