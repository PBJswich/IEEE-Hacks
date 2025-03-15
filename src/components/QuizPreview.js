'use client'

// Component that displays the generated quiz questions
// Shows a loading state while questions are being generated
import { useState } from 'react'

export default function QuizPreview({ questions, isLoading }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  
  // Don't show anything if we don't have questions and aren't loading
  if (questions.length === 0 && !isLoading) {
    return null
  }
  
  // Handle when a user selects an answer
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    })
  }
  
  // Calculate the score when submitting the quiz
  const calculateScore = () => {
    let score = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        score++
      }
    })
    return score
  }
  
  // Show loading spinner while generating questions
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2">Generating quiz questions...</p>
      </div>
    )
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Quiz Questions</h2>
      
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="mb-6 p-4 border rounded-lg">
          <p className="font-semibold mb-2">{qIndex + 1}. {question.question}</p>
          
          <div className="ml-4">
            {question.answers && question.answers.map((answer, aIndex) => (
              <div key={aIndex} className="mb-2">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={selectedAnswers[qIndex] === aIndex}
                    onChange={() => handleAnswerSelect(qIndex, aIndex)}
                    className="mt-1 mr-2"
                    disabled={showResults}
                  />
                  <span 
                    className={`${
                      showResults && aIndex === question.correctAnswerIndex
                        ? 'text-green-600 font-medium'
                        : showResults && selectedAnswers[qIndex] === aIndex && aIndex !== question.correctAnswerIndex
                        ? 'text-red-600 line-through'
                        : ''
                    }`}
                  >
                    {answer}
                  </span>
                </label>
              </div>
            ))}
          </div>
          
          {/* Show explanation when results are displayed */}
          {showResults && (
            <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
              <p className="font-medium">Explanation:</p>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      ))}
      
      {questions.length > 0 && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Submit Answers
        </button>
      )}
      
      {showResults && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="font-bold">
            Your Score: {calculateScore()} out of {questions.length}
            ({Math.round((calculateScore() / questions.length) * 100)}%)
          </p>
        </div>
      )}
    </div>
  )
}