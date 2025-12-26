// Google Gemini API service for AI responses

// Read API key from Vite env. You must set VITE_GEMINI_API_KEY in your .env file.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// Use v1beta endpoint with a modern Flash model.
// You requested Gemini 2.x Flash; update GEMINI_MODEL if your key supports 2.5.
// Examples: 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.5-flash'.
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface ResumeAnalysis {
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<ResumeAnalysis> {
  try {
    const prompt = jobDescription
      ? `Analyze this resume and provide suggestions for applying to this job:

Job Description: ${jobDescription}

Resume Text:
${resumeText}

Please provide:
1. Key strengths that match the job requirements
2. Areas for improvement
3. Specific suggestions to enhance the resume for this job
4. A brief summary of the resume

Format your response as a structured analysis.`

      : `Analyze this resume and provide suggestions:

Resume Text:
${resumeText}

Please provide:
1. Key strengths
2. Areas for improvement
3. Specific suggestions to enhance the resume
4. A brief summary

Format your response as a structured analysis.`;

    const text = await generateOpenRouterText(prompt);

    // Parse the response into structured format
    return parseGeminiResponse(text);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      suggestions: ['Unable to analyze resume. Please try again.'],
      strengths: [],
      improvements: [],
      summary: 'Analysis unavailable.',
    };
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateGeminiText(prompt: string, retries = 2): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = { error: { message: errorBody } };
        }

        // Handle 429 (Quota Exceeded) specifically
        if (response.status === 429) {
          const errorMessage = errorData?.error?.message || 'Quota exceeded';
          throw new Error(
            `Gemini API quota exceeded. Please check your billing and quota limits at https://ai.google.dev/gemini-api/docs/quota. ` +
            `You may need to upgrade your plan or wait for quota reset. Error: ${errorMessage}`
          );
        }

        // Handle 403 (Forbidden) - might be API key issue
        if (response.status === 403) {
          throw new Error(
            `Gemini API access forbidden. Please verify your API key has the correct permissions and billing is enabled. ` +
            `Visit https://ai.google.dev/ to check your API key status.`
          );
        }

        // For other errors, retry if we have attempts left
        if (attempt < retries && response.status >= 500) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.warn(`Gemini API error ${response.status}, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries + 1})`);
          await sleep(delay);
          continue;
        }

        console.error('Gemini API error response:', errorBody);
        throw new Error(`Gemini API error: ${response.status}. ${errorBody.substring(0, 200)}`);
      }

      const data = await response.json();
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        console.error('Empty response from Gemini. Full response:', JSON.stringify(data, null, 2));
        throw new Error('Empty response from Gemini. Please try again.');
      }
      return text;
    } catch (error) {
      // If it's a quota error or final attempt, throw immediately
      if (error instanceof Error && (error.message.includes('quota') || attempt === retries)) {
        throw error;
      }
      
      // For network errors, retry
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries + 1})`);
        await sleep(delay);
        continue;
      }
      
      // Final attempt failed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to connect to Gemini API. Please check your connection and try again.');
    }
  }

  throw new Error('Failed to generate response after retries.');
}

// Keep backward compatibility aliases
export async function generateOpenRouterText(prompt: string): Promise<string> {
  return generateGeminiText(prompt);
}

// Keep the old function names for backward compatibility
export const generateChatGPTText = generateGeminiText;

function parseGeminiResponse(text: string): ResumeAnalysis {
  // Simple parsing - in production, you'd want more robust parsing
  const lines = text.split('\n').filter(line => line.trim());
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  const suggestions: string[] = [];
  let summary = '';

  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('strength') || lowerLine.includes('strong')) {
      currentSection = 'strengths';
    } else if (lowerLine.includes('improvement') || lowerLine.includes('weakness') || lowerLine.includes('area for')) {
      currentSection = 'improvements';
    } else if (lowerLine.includes('suggestion') || lowerLine.includes('recommendation')) {
      currentSection = 'suggestions';
    } else if (lowerLine.includes('summary') || lowerLine.includes('overview')) {
      currentSection = 'summary';
    } else if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
      const cleanLine = line.replace(/^[-•\d.\s]+/, '').trim();
      
      if (currentSection === 'strengths' && cleanLine) {
        strengths.push(cleanLine);
      } else if (currentSection === 'improvements' && cleanLine) {
        improvements.push(cleanLine);
      } else if (currentSection === 'suggestions' && cleanLine) {
        suggestions.push(cleanLine);
      }
    } else if (currentSection === 'summary' && line.trim()) {
      summary += line.trim() + ' ';
    }
  }

  // If parsing didn't work well, use the raw text
  if (strengths.length === 0 && improvements.length === 0 && suggestions.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    suggestions.push(...paragraphs.slice(0, 5));
    summary = paragraphs[0] || text.substring(0, 200);
  }

  return {
    suggestions: suggestions.length > 0 ? suggestions : ['Review your resume for grammar and formatting.'],
    strengths: strengths.length > 0 ? strengths : ['Your resume has been submitted for analysis.'],
    improvements: improvements.length > 0 ? improvements : ['Consider adding more specific achievements.'],
    summary: summary.trim() || text.substring(0, 200),
  };
}

// Extract text from PDF using PDF.js
// To use this, install PDF.js: npm install pdfjs-dist
// Then uncomment and use the code below
export async function extractTextFromPDF(file: File): Promise<string> {
  // TODO: Install pdfjs-dist package: npm install pdfjs-dist
  // Then uncomment the code below:
  
  /*
  import * as pdfjsLib from 'pdfjs-dist';
  
  // Set worker path (adjust based on your build setup)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
  */
  
  // Placeholder for now
  return Promise.resolve('PDF text extraction requires pdfjs-dist package. Please install it and uncomment the code above.');
}

