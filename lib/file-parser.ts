/**
 * File Parser Utilities
 *
 * Supports parsing of various file types:
 * - PDF (.pdf)
 * - Word Documents (.docx)
 * - Text files (.txt, .md, .json, .csv, etc.)
 * - CSV/Excel files (.csv, .xlsx via CSV export)
 * - Code files (any text-based file)
 */

// Use require for CommonJS modules that don't have proper ESM exports
const pdfParse = require('pdf-parse')
import mammoth from 'mammoth'
const Papa = require('papaparse')

export interface ParsedFile {
  filename: string
  mimeType: string
  size: number
  text: string // Extracted text content
  metadata?: {
    pages?: number // For PDFs
    rows?: number // For CSVs
    columns?: string[] // For CSVs
    language?: string // Detected language
    [key: string]: any
  }
}

/**
 * Parse a file buffer based on its MIME type
 */
export async function parseFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedFile> {
  const extension = filename.split('.').pop()?.toLowerCase()

  try {
    // PDF files
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return await parsePDF(buffer, filename, mimeType)
    }

    // Word documents (.docx)
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === 'docx'
    ) {
      return await parseWordDocument(buffer, filename, mimeType)
    }

    // CSV files
    if (mimeType === 'text/csv' || extension === 'csv') {
      return await parseCSV(buffer, filename, mimeType)
    }

    // Text-based files (txt, md, json, code files, etc.)
    if (mimeType.startsWith('text/') || isTextBasedFile(extension || '')) {
      return parseTextFile(buffer, filename, mimeType)
    }

    // Unsupported file type
    throw new Error(`Unsupported file type: ${mimeType}`)
  } catch (error: any) {
    throw new Error(`Failed to parse ${filename}: ${error.message}`)
  }
}

/**
 * Parse PDF files using pdf-parse
 */
async function parsePDF(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedFile> {
  const data = await pdfParse(buffer)

  return {
    filename,
    mimeType,
    size: buffer.length,
    text: data.text,
    metadata: {
      pages: data.numpages,
      info: data.info,
    },
  }
}

/**
 * Parse Word documents (.docx) using mammoth
 */
async function parseWordDocument(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedFile> {
  const result = await mammoth.extractRawText({ buffer })

  return {
    filename,
    mimeType,
    size: buffer.length,
    text: result.value,
    metadata: {
      messages: result.messages.length > 0 ? result.messages : undefined,
    },
  }
}

/**
 * Parse CSV files using papaparse
 */
async function parseCSV(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedFile> {
  const csvText = buffer.toString('utf-8')
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  // Convert parsed data to formatted text
  let text = ''
  if (parsed.meta.fields && parsed.meta.fields.length > 0) {
    text += `Columns: ${parsed.meta.fields.join(', ')}\n\n`
  }

  // Add sample rows (first 50 rows)
  const sampleSize = Math.min(50, parsed.data.length)
  text += `Sample Data (first ${sampleSize} of ${parsed.data.length} rows):\n`
  text += JSON.stringify(parsed.data.slice(0, sampleSize), null, 2)

  return {
    filename,
    mimeType,
    size: buffer.length,
    text,
    metadata: {
      rows: parsed.data.length,
      columns: parsed.meta.fields,
      errors: parsed.errors.length > 0 ? parsed.errors : undefined,
    },
  }
}

/**
 * Parse text-based files
 */
function parseTextFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): ParsedFile {
  const text = buffer.toString('utf-8')

  return {
    filename,
    mimeType,
    size: buffer.length,
    text,
    metadata: {
      lines: text.split('\n').length,
      characters: text.length,
    },
  }
}

/**
 * Check if a file extension is text-based
 */
function isTextBasedFile(extension: string): boolean {
  const textExtensions = [
    // Text
    'txt',
    'md',
    'markdown',
    'rst',
    // Code
    'js',
    'jsx',
    'ts',
    'tsx',
    'py',
    'java',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'go',
    'rs',
    'rb',
    'php',
    'swift',
    'kt',
    'scala',
    'sh',
    'bash',
    'zsh',
    'fish',
    // Config
    'json',
    'yaml',
    'yml',
    'toml',
    'xml',
    'ini',
    'cfg',
    'conf',
    // Web
    'html',
    'htm',
    'css',
    'scss',
    'sass',
    'less',
    'svg',
    // Data
    'csv',
    'tsv',
    'log',
  ]

  return textExtensions.includes(extension.toLowerCase())
}

/**
 * Validate file size (max 10MB for parsing)
 */
export function validateFileSize(size: number, maxSizeMB: number = 10): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (size > maxSizeBytes) {
    throw new Error(`File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`)
  }
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string, filename: string): void {
  const extension = filename.split('.').pop()?.toLowerCase()

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'text/plain',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
  ]

  const allowedExtensions = [
    'pdf',
    'docx',
    'csv',
    'txt',
    'md',
    'json',
    'xml',
    'html',
    'css',
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'java',
    'c',
    'cpp',
    'go',
    'rs',
    'rb',
    'php',
  ]

  if (
    !allowedMimeTypes.includes(mimeType) &&
    !allowedExtensions.includes(extension || '')
  ) {
    throw new Error(`Unsupported file type: ${mimeType} (.${extension})`)
  }
}

/**
 * Get a human-readable summary of a parsed file
 */
export function getFileSummary(parsed: ParsedFile): string {
  let summary = `File: ${parsed.filename}\n`
  summary += `Type: ${parsed.mimeType}\n`
  summary += `Size: ${(parsed.size / 1024).toFixed(2)} KB\n`

  if (parsed.metadata?.pages) {
    summary += `Pages: ${parsed.metadata.pages}\n`
  }

  if (parsed.metadata?.rows) {
    summary += `Rows: ${parsed.metadata.rows}\n`
  }

  if (parsed.metadata?.columns) {
    summary += `Columns: ${parsed.metadata.columns.join(', ')}\n`
  }

  if (parsed.metadata?.lines) {
    summary += `Lines: ${parsed.metadata.lines}\n`
  }

  summary += `\nContent Preview (first 500 characters):\n${parsed.text.substring(0, 500)}${parsed.text.length > 500 ? '...' : ''}`

  return summary
}
