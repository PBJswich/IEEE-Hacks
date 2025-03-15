export async function generateQuiz(text, questionCount = 5) {
  try {
    // Truncate text if it's too long (API limits)
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

    // Create a prompt for the AI
    const prompt = `
    You are an expert quiz creator. Based on the following text, create ${questionCount} multiple-choice questions.
    
    TEXT:
    ${truncatedText}
    
    For each question:
    1. Create a clear, concise question based on important information in the text
    2. Provide 4 possible answers, with only one being correct
    3. Indicate which answer is correct by including a "correctAnswerIndex" field (0 for first option, 1 for second, etc.)
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
      
      // Convert answer string to correctAnswerIndex if needed
      questions = questions.map(q => {
        // If we have options and answer but no correctAnswerIndex
        if (q.options && q.answer && typeof q.correctAnswerIndex === 'undefined') {
          // Find the index of the correct answer in the options array
          const index = q.options.findIndex(option => 
            option === q.answer || option.includes(q.answer) || q.answer.includes(option)
          );
          
          // If found, use it; otherwise randomize
          q.correctAnswerIndex = index >= 0 ? index : Math.floor(Math.random() * q.options.length);
        }
        
        // Ensure we have an explanation
        if (!q.explanation) {
          q.explanation = `The correct answer is ${q.options[q.correctAnswerIndex]}.`;
        }
        
        return q;
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback to simple questions if parsing fails
      questions = createFallbackQuestions(text, questionCount);
    }

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback to simple questions if API call fails
    return createFallbackQuestions(text, questionCount);
  }
}

