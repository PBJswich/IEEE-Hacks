# TestTrekker - Technical Doc

https://ieee-hacks.vercel.app

## Overview

I created a web app that allows users to generate quizzes based on provided text content. It uses AI to analyze the text and create relevant multiple-choice questions, with the ability to customize the number of questions. Users can take the quiz, receive immediate feedback, and export their results as a Word document.

## Architecture

The application is built using Next.js, a React framework that enables server-side rendering and static site generation. The key components include:

### Frontend

- **React Components**: Modular UI components for different parts of the application
- **TailwindCSS**: Utility-first CSS framework for styling
- **Client-side State Management**: Using React's useState and useEffect hooks

### Backend

- **Next.js API Routes**: Serverless functions for handling API requests
- **Groq API Integration**: For AI-powered quiz generation
- **Document Generation**: Using docx library for Word document export

## Key Components

### Quiz Generation

The quiz generation process is handled by the `quizGeneration.js` module, which:

1. Takes input text and desired question count
2. Sends a prompt to the Groq API (using LLaMA 3 model)
3. Processes the response to extract structured quiz questions
4. Returns formatted questions with options, correct answers, and explanations

### User Interface

The application's UI consists of several key components:

- **Text Input**: Where users paste or type the content for quiz generation
- **Quiz Configuration**: Options to customize the quiz (number of questions)
- **Quiz Display**: Renders questions and multiple-choice options
- **Results View**: Shows score and explanations after submission
- **Export Functionality**: Allows downloading results as a Word document

## Data Flow

1. User inputs text content and quiz parameters
2. Application sends request to Groq API via the quizGeneration module
3. API returns generated questions in JSON format
4. Questions are rendered in the QuizPreview component
5. User selects answers and submits the quiz
6. Application calculates score and displays results with explanations
7. User can export results or generate a new quiz

## Technologies Used

- **Next.js**: React framework for the application
- **React**: Frontend library for building user interfaces
- **TailwindCSS**: For styling components
- **Groq API**: AI service for generating quiz questions
- **docx**: Library for creating Word documents
- **file-saver**: For downloading generated documents

## Implementation Details

### AI Prompt Engineering

The application uses a carefully crafted prompt to instruct the AI model to generate appropriate quiz questions:

```javascript
const prompt = `
You are an expert quiz creator. Based on the following text, create ${questionCount} multiple-choice questions.

TEXT:
${truncatedText}

For each question:
1. Create a clear, concise question based on important information in the text
2. Provide 4 possible answers, with only one being correct
3. Indicate which answer is correct by including a "correctAnswerIndex" field
4. Provide a brief explanation for why the correct answer is right

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 2,
    "explanation": "Explanation of why Option C is correct, referencing the text."
  },
  ...more questions...
]
`;
```