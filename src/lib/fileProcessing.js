import mammoth from 'mammoth'

export async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const isDocFile = file.name.toLowerCase().endsWith('.doc')
    
    if (isDocFile) {
      throw new Error('DOC format is not supported. Please convert to DOCX or PDF.')
    }
    
    const result = await mammoth.extractRawText({ buffer })
    
    const maxLength = 3000
    let extractedText = result.value
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + '...\n\n[Content truncated due to length]'
    }
    
    return extractedText
  } catch (error) {
    console.error('Error extracting text from DOCX/DOC:', error)
    throw new Error('Failed to extract text from document: ' + error.message)
  }
}

export async function extractTextFromTXT(file) {
  try {
    const text = await file.text()
    
    const maxLength = 3000
    let extractedText = text
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + '...\n\n[Content truncated due to length]'
    }
    
    return extractedText
  } catch (error) {
    console.error('Error extracting text from TXT:', error)
    throw new Error('Failed to extract text from TXT: ' + error.message)
  }
}