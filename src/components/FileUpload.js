// Handle file uploads and processing
// Sends the file to the API and manages the upload state
import { useState } from 'react'

export default function FileUpload({ setQuestions, setIsLoading, setError }) {
  const [dragActive, setDragActive] = useState(false)
  
  // handle the file upload process
  const processFile = async (file) => {
    // make sure we have a file to work with
    if (!file) return
    
    // reset any previous state
    setQuestions([])
    setError('')
    setIsLoading(true)
    
    // create form data to send the file
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Send to our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file')
      }
      
      // Update with the generated questions
      setQuestions(data.questions)
    } catch (error) {
      console.error('Error uploading file:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle normal file input change
  const handleChange = (e) => {
    const file = e.target.files[0]
    processFile(file)
  }
  
  // These handle the drag and drop functionality
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }
  
  return (
    <div 
      className={`p-8 border-2 border-dashed rounded-lg text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <p className="mb-4">Drag and drop a file or click to select</p>
      <p className="text-sm text-gray-500 mb-4">Supported formats: DOCX, TXT</p>
      
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept=".docx,.txt"
      />
      
      <label
        htmlFor="file-upload"
        className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
      >
        Select File
      </label>
    </div>
  )
}