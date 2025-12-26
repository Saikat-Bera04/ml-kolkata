// OpenRouter API service for job search

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export interface JobSearchParams {
  field: string;
  location: string;
  jobType?: string;
  experienceLevel?: string;
  workType?: string;
}

export interface JobResult {
  title: string;
  company: string;
  location: string;
  type: string; // Full Time, Part Time, Contract, etc.
  work_type: string; // Remote, Hybrid, On-site
  description: string;
  apply_link: string;
  experience_level?: string;
  salary_range?: string;
  industry?: string;
  posted_date?: string;
  // Keep legacy fields for backward compatibility
  link?: string;
  snippet?: string;
  displayLink?: string;
}

export async function searchJobs(params: JobSearchParams, startIndex: number = 1): Promise<{
  jobs: JobResult[];
  totalResults: number;
}> {
  try {
    // Build structured query for OpenRouter
    let query = `${params.field} jobs in ${params.location}`;
    
    if (params.jobType && params.jobType !== '') {
      query += ` for ${params.jobType}`;
    }
    
    if (params.workType && params.workType !== '') {
      query += ` ${params.workType}`;
    }

    if (params.experienceLevel && params.experienceLevel !== '') {
      query += ` ${params.experienceLevel}`;
    }

    // Create prompt for OpenRouter to search and return structured job data
    const prompt = `You are a job search assistant. Search the internet for real job openings and return them in a structured JSON format.

Search Query: "${query}"

Please search for actual job postings from reputable job sites like LinkedIn, Indeed, Naukri, Glassdoor, AngelList, and company career pages. Return a JSON array of job listings with the following structure:

{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country or Remote",
      "type": "Full Time" or "Part Time" or "Contract" or "Temporary" or "Volunteer",
      "work_type": "Remote" or "Hybrid" or "On-site",
      "description": "2-3 line job description snippet",
      "apply_link": "REAL WORKING URL to the job posting (LinkedIn, Indeed, company careers page, etc.)",
      "experience_level": "Entry Level" or "Mid Senior Level" or "Director" (if available),
      "salary_range": "Salary range if available",
      "industry": "Industry name if available",
      "posted_date": "Date or 'X days ago' if available"
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks, no extra text
2. The apply_link MUST be a real, working URL to an actual job posting
3. Return at least 10-15 job listings
4. Ensure all URLs are valid and accessible
5. Include jobs from multiple sources (LinkedIn, Indeed, Naukri, etc.)
6. Make sure the jobs are recent and relevant to the search query

Return the JSON response now:`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      ...(typeof window !== 'undefined' && {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Adapti-Learn',
      }),
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API error response:', errorBody);
      throw new Error(`OpenRouter API error: ${response.status}. ${errorBody.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // Parse JSON response - handle markdown code blocks if present
    let jsonContent = content;
    if (jsonContent.includes('```json')) {
      const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    } else if (jsonContent.includes('```')) {
      const codeMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonContent = codeMatch[1].trim();
      }
    }

    // Try to extract JSON if there's extra text
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const parsedData = JSON.parse(jsonContent);
    const jobs: JobResult[] = parsedData.jobs || [];

    // Ensure backward compatibility - map new fields to old ones
    const mappedJobs = jobs.map(job => ({
      ...job,
      link: job.apply_link || job.link,
      snippet: job.description || job.snippet,
      displayLink: job.company || job.displayLink,
    }));

    return {
      jobs: mappedJobs,
      totalResults: mappedJobs.length,
    };
  } catch (error) {
    console.error('Error searching jobs:', error);
    return {
      jobs: [],
      totalResults: 0,
    };
  }
}

// Helper function to extract company name from job
export function extractCompanyName(job: JobResult): string {
  // Use the company field if available (from OpenRouter)
  if (job.company) {
    return job.company;
  }
  
  // Fallback to extracting from displayLink or link
  if (job.displayLink) {
    const domain = job.displayLink;
    const company = domain
      .replace('www.', '')
      .replace('.com', '')
      .replace('.in', '')
      .replace('.co', '')
      .split('.')[0];
    return company.charAt(0).toUpperCase() + company.slice(1);
  }
  
  if (job.link) {
    try {
      const url = new URL(job.link);
      const domain = url.hostname;
      const company = domain
        .replace('www.', '')
        .replace('.com', '')
        .replace('.in', '')
        .replace('.co', '')
        .split('.')[0];
      return company.charAt(0).toUpperCase() + company.slice(1);
    } catch {
      return 'Company';
    }
  }
  
  return 'Company';
}

// Helper function to extract job type
export function extractJobType(job: JobResult, params: JobSearchParams): string {
  // Use the type field if available (from OpenRouter)
  if (job.type) {
    return job.type;
  }
  return params.jobType || 'Full Time';
}

// Helper function to determine work type
export function extractWorkType(job: JobResult, params: JobSearchParams): string {
  // Use the work_type field if available (from OpenRouter)
  if (job.work_type) {
    return job.work_type;
  }
  
  // Fallback to extracting from text
  const text = ((job.title || '') + ' ' + (job.snippet || '') + ' ' + (job.description || '')).toLowerCase();
  
  if (text.includes('remote') || text.includes('work from home')) {
    return 'Remote';
  }
  if (text.includes('hybrid')) {
    return 'Hybrid';
  }
  return params.workType || 'On-site';
}
