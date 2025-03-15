export async function generateQuiz(text) {
  try {
    // Truncate text if it's too long (API limits)
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

    // Create a prompt for the AI
    const prompt = `
    You are an expert quiz creator. Based on the following text, create 5 multiple-choice questions.
    
    TEXT:
    ${truncatedText}
    
    For each question:
    1. Create a clear, concise question based on important information in the text
    2. Provide 4 possible answers, with only one being correct
    3. Indicate which answer is correct
    
    Format your response as a JSON array with this structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option A"
      },
      ...more questions...
    ]
    
    Only return the JSON array, nothing else.
    `;

    // Call the Groq API directly using fetch
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content;
    
    let questions;
    try {
      // Extract JSON from the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseContent;
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback to simple questions if parsing fails
      questions = createFallbackQuestions(text);
    }

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback to simple questions if API call fails
    return createFallbackQuestions(text);
  }
}

// Fallback function to create simple questions if the API call fails
function createFallbackQuestions(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const questions = [];
  
  // Generate up to 5 questions or as many as we can from the text
  const questionCount = Math.min(5, Math.floor(sentences.length / 2));
  
  for (let i = 0; i < questionCount; i++) {
    const sentenceIndex = i * 2;
    if (sentenceIndex < sentences.length) {
      const sentence = sentences[sentenceIndex].trim();
      
      // Create a simple question from the sentence
      const words = sentence.split(' ').filter(w => w.length > 4);
      
      if (words.length > 3) {
        // Pick a word to ask about
        const wordIndex = Math.floor(Math.random() * words.length);
        const word = words[wordIndex];
        
        // Create a question
        const question = `What does the text say about "${word}"?`;
        
        // Create options (one correct, three incorrect)
        const correctAnswer = `It relates to ${sentence.substring(0, 50)}...`;
        const incorrectAnswers = [
          `It's not mentioned in the text`,
          `It's the main topic of the entire document`,
          `It's described as unimportant`
        ];
        
        // Shuffle options
        const options = [correctAnswer, ...incorrectAnswers];
        for (let j = options.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [options[j], options[k]] = [options[k], options[j]];
        }
        
        questions.push({
          question,
          options,
          answer: correctAnswer
        });
      }
    }
  }
  
  // If we couldn't generate enough questions, add some generic ones
  while (questions.length < 3) {
    questions.push({
      question: `What is one of the main topics discussed in this document?`,
      options: [
        'The content provided in the document',
        'Quantum physics',
        'Ancient history',
        'Modern art'
      ],
      answer: 'The content provided in the document'
    });
  }
  
  return questions;
}