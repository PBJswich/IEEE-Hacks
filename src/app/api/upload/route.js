import { NextResponse } from 'next/server'
import { extractTextFromPDF, extractTextFromDOCX, extractTextFromTXT } from '@/lib/fileProcessing'
import { generateQuiz } from '@/lib/quizGeneration'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Processing file:', file.name, 'Type:', file.type)

    // Extract text based on file type
    const fileType = file.name.split('.').pop().toLowerCase()
    let extractedText = ''
    
    try {
      if (fileType === 'pdf') {
        extractedText = await extractTextFromPDF(file)
      } else if (fileType === 'docx' || fileType === 'doc') {
        extractedText = await extractTextFromDOCX(file)
      } else if (fileType === 'txt') {
        extractedText = await extractTextFromTXT(file)
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError)
      return NextResponse.json(
        { error: `Failed to extract text: ${extractError.message}` },
        { status: 500 }
      )
    }

    if (!extractedText || extractedText.trim() === '') {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      )
    }

    console.log('Text extracted successfully, generating quiz...')

    // Generate quiz questions from the extracted text
    try {
      const questions = await generateQuiz(extractedText)
      return NextResponse.json({ questions })
    } catch (quizError) {
      console.error('Quiz generation error:', quizError)
      return NextResponse.json(
        { error: `Failed to generate quiz: ${quizError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to process file: ' + error.message },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}