import { generateGeminiText } from './gemini';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ProfileSignals {
  recentSubjects: string[];
  mastery: Record<string, number>;
  weakConcepts: string[];
  quizAccuracy: number;
  dailyPlan: string;
  nextSession: string;
  timetableEntry: string;
  bookmarks: string[];
  recommendedVideos: string[];
  courseProgress: Record<string, string>;
}

export const EDUCATION_ONLY_RESPONSE = 'Out of context — I can only assist with educational questions.';

const EDUCATIONAL_KEYWORDS = [
  // Learning verbs
  'study', 'learn', 'teach', 'explain', 'understand', 'practice', 'solve', 'help',
  // Academic terms
  'quiz', 'exam', 'test', 'assignment', 'homework', 'project', 'lab', 'labwork',
  'concept', 'topic', 'subject', 'course', 'class', 'lecture', 'tutorial',
  'notes', 'syllabus', 'curriculum', 'textbook', 'book',
  // Question words (very common in educational queries)
  'what', 'how', 'why', 'when', 'where', 'which', 'who',
  // Educational actions
  'clarify', 'doubt', 'question', 'answer', 'problem', 'solution', 'example',
  'definition', 'meaning', 'difference', 'similarity', 'compare', 'contrast',
  // Academic subjects (common ones)
  'math', 'mathematics', 'algebra', 'calculus', 'geometry', 'physics', 'chemistry',
  'biology', 'science', 'computer', 'programming', 'coding', 'code', 'algorithm',
  'data structure', 'database', 'software', 'engineering', 'design',
  'history', 'literature', 'language', 'english', 'writing', 'essay',
  // Career and professional
  'career', 'internship', 'job', 'interview', 'resume', 'cv', 'skill',
  'research', 'thesis', 'dissertation', 'paper', 'publication',
  // General educational context
  'university', 'college', 'school', 'student', 'teacher', 'professor',
  'degree', 'bachelor', 'master', 'phd', 'graduate', 'undergraduate',
  'semester', 'trimester', 'quarter', 'academic', 'education',
  // Study techniques
  'review', 'revise', 'memorize', 'remember', 'recall', 'prepare',
  'strategy', 'technique', 'method', 'approach', 'tip', 'trick',
  // Common question patterns
  'can you', 'could you', 'would you', 'should i', 'do you know',
  'tell me', 'show me', 'give me', 'i need', 'i want to',
];

const BLOCKED_TOPICS = ['dating', 'relationship advice', 'romance', 'violence', 'weapon'];

export function isEducationalPrompt(prompt: string) {
  const lower = prompt.toLowerCase().trim();
  
  // Empty or very short prompts are not educational
  if (lower.length < 2) {
    return false;
  }

  // Block explicitly non-educational topics (very strict blocking only)
  // Only block if the prompt is clearly about these topics, not just mentions them
  const strictBlockedPatterns = [
    /^(dating|romance|relationship advice)/i,
    /violence|weapon|gun|knife/i,
  ];
  
  if (strictBlockedPatterns.some((pattern) => pattern.test(lower))) {
    return false;
  }

  // Allow everything else - let Gemini's system instruction handle filtering
  // This is more permissive and relies on Gemini's understanding of educational content
  // The system instruction already tells Gemini to only answer educational questions
  return true;
}

export async function sendChatToAssistant(
  prompt: string,
  history: ChatMessage[],
  profile: ProfileSignals
): Promise<string> {
  if (!isEducationalPrompt(prompt)) {
    return EDUCATION_ONLY_RESPONSE;
  }

  const systemInstruction = buildSystemInstruction(profile);
  const conversation = history
    .map((msg) => `${msg.role === 'user' ? 'Learner' : 'Spark AI'}: ${msg.content}`)
    .join('\n');

  const fullPrompt = `${systemInstruction}

Conversation so far:
${conversation}

Learner: ${prompt}
Spark AI:`;

  try {
    return await generateGeminiText(fullPrompt);
  } catch (error) {
    console.error('Chatbot error', error);
    return generateFallbackResponse(prompt, profile);
  }
}

function buildSystemInstruction(profile: ProfileSignals) {
  return `
You are "Spark AI Mentor", an education-only study assistant for Adapti-Learn.
RULES:
1. Only answer academic questions (subjects, coding, quizzes, projects, study plans, career readiness).
2. If the query is unrelated to education, respond with "${EDUCATION_ONLY_RESPONSE}".
3. Personalize guidance with the student's signals and always suggest next actions (videos, quizzes, plans).
4. Never invent platform data—if unknown, acknowledge it.
5. Keep tone encouraging, concise, and structured with bullet points when useful.

Student snapshot:
- Recent subjects: ${profile.recentSubjects.join(', ')}
- Mastery: ${Object.entries(profile.mastery)
    .map(([k, v]) => `${k} ${v}%`)
    .join(' | ')}
- Weak concepts: ${profile.weakConcepts.join(', ')}
- Quiz accuracy: ${profile.quizAccuracy}%
- Daily study plan: ${profile.dailyPlan}
- Next session: ${profile.nextSession}
- Timetable entry: ${profile.timetableEntry}
- Bookmarks: ${profile.bookmarks.join(', ')}
- Recommended videos: ${profile.recommendedVideos.join(', ')}
- Course progress: ${Object.entries(profile.courseProgress)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ')}
`.trim();
}

function generateFallbackResponse(prompt: string, profile: ProfileSignals) {
  const promptLower = prompt.toLowerCase();
  const masteryEntries = Object.entries(profile.mastery).sort((a, b) => a[1] - b[1]);
  const weakestArea = masteryEntries[0]?.[0];
  const focusConcept =
    profile.weakConcepts.find((concept) => promptLower.includes(concept.toLowerCase())) ?? profile.weakConcepts[0];
  const inferredSubject =
    masteryEntries.find(([subject]) => promptLower.includes(subject.toLowerCase()))?.[0] ?? weakestArea ?? 'this topic';

  const studyTip = [
    `Focus on the core definition, then work through a small worked example.`,
    `Test yourself with 2-3 rapid-fire questions after studying each mini concept.`,
    `Compare your answer with official solutions to identify the gap.`,
    `Teach the concept back to an imaginary peer to lock it in.`,
  ];
  const tip = studyTip[Math.floor(Math.random() * studyTip.length)];

  return [
    `I couldn't reach the AI service, but here's a focused plan for ${inferredSubject}:`,
    ``,
    `• Start with the key concept **${focusConcept}** and map it to one real example.`,
    `• Revisit your daily focus (${profile.dailyPlan}) and integrate this concept there.`,
    `• Schedule a 10-minute recap before your next session (${profile.nextSession}) so it sticks.`,
    ``,
    `Pro tip: ${tip}`,
    ``,
    `Ask again once your connection stabilizes and I’ll fetch deeper insights.`,
  ].join('\n');
}


