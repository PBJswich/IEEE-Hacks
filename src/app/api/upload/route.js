import { NextResponse } from 'next/server'
import { extractTextFromDOCX, extractTextFromTXT } from '@/lib/fileProcessing'
import { generateQuiz } from '@/lib/quizGeneration'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const questionCount = parseInt(formData.get('questionCount') || '10')
    
    // Validate question count
    const validQuestionCount = Math.min(Math.max(questionCount, 5), 20)
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Questions:', validQuestionCount)

    // Extract text based on file type
    const fileType = file.name.split('.').pop().toLowerCase()
    let extractedText = ''
    
    try {
      // only supporting DOCX and TXT files now
      if (fileType === 'docx' || fileType === 'doc') {
        extractedText = await extractTextFromDOCX(file)
      } else if (fileType === 'txt') {
        extractedText = await extractTextFromTXT(file)
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload a DOCX or TXT file.' },
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
      const rawQuestions = await generateQuiz(extractedText, validQuestionCount)
      
      // Ensure each question has the required fields
      const questions = rawQuestions.map(question => {
        // Make sure answers is an array
        const answers = Array.isArray(question.answers) ? 
          question.answers : 
          question.options || ['Option A', 'Option B', 'Option C', 'Option D']
        
        // Make sure correctAnswerIndex is a number
        let correctAnswerIndex = question.correctAnswerIndex
        if (typeof correctAnswerIndex !== 'number') {
          // Try to find the correct answer index from the correctAnswer property if it exists
          if (question.correctAnswer && answers.includes(question.correctAnswer)) {
            correctAnswerIndex = answers.indexOf(question.correctAnswer)
          } else {
            correctAnswerIndex = 0 // Default to first answer if we can't determine
          }
        }
        
        return {
          question: question.question || 'Question not available',
          answers: answers,
          correctAnswerIndex: correctAnswerIndex,
          explanation: question.explanation || 'No explanation provided',
          id: Math.random().toString(36).substring(2, 15) 
        }
      })
      
      return NextResponse.json({ 
        questions,
        questionCount: validQuestionCount
      })
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