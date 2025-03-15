'use client'

// Component that displays the generated quiz questions
// Shows a loading state while questions are being generated
import { useState, useEffect } from 'react'

export default function QuizPreview({ questions, isLoading, onTakeAnotherQuiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  
  // Reset internal state when questions array changes or is emptied
  useEffect(() => {
    setSelectedAnswers({})
    setShowResults(false)
  }, [questions])
  
  // Handle taking another quiz
  const handleTakeAnother = () => {
    // Reset internal component state
    setSelectedAnswers({})
    setShowResults(false)
    // Call the parent component's handler
    if (onTakeAnotherQuiz) onTakeAnotherQuiz()
  }
  
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
            <div className="mt-2 text-sm bg-blue-50 p-3 rounded border border-blue-200">
              <p className="font-medium text-gray-800">Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>
      ))}
      
      {/* Render the Submit Answers button only when we have questions and results aren't shown yet */}
      {questions.length > 0 && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Submit Answers
        </button>
      )}
      
      {showResults && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-bold text-gray-800">
            Your Score: {calculateScore()} out of {questions.length}
            ({Math.round((calculateScore() / questions.length) * 100)}%)
          </p>
          
          {/* Update the button to use our new handler */}
          <button
            onClick={handleTakeAnother}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  )
}