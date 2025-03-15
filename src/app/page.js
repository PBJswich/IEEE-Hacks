'use client'

// Main landing page component that brings everything together
// Handles the overall layout and state management for the quiz app
import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import QuizPreview from '@/components/QuizPreview'

export default function Home() {
  // Track the generated questions and loading state
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Quiz Generator</h1>
        
        {/* File upload component handles the document processing */}
        <FileUpload 
          setQuestions={setQuestions} 
          setIsLoading={setIsLoading} 
          setError={setError} 
        />
        
        {/* Show error message if something went wrong */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Display the generated quiz questions */}
        <QuizPreview 
          questions={questions} 
          isLoading={isLoading} 
        />
      </div>
    </main>
  )
}
