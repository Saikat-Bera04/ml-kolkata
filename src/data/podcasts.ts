// Podcast section data structure

export interface PodcastSection {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  channels?: string[]; // Optional channel names for better targeting
  color: string;
}

export const podcastSections: PodcastSection[] = [
  {
    id: 'concept-breakdown',
    title: 'Concept Breakdown Podcasts',
    description: 'Learn core concepts from top educational channels',
    keywords: [
      'Data Structures Explained',
      'OS Fundamentals Lecture',
      'DBMS Basics for Beginners',
      'Thermodynamics full course audio',
      'Digital Logic explained',
      'Computer Networks basics',
    ],
    channels: ['Neso Academy', 'Gate Smashers', 'CodeWithHarry'],
    color: 'blue',
  },
  {
    id: 'exam-preparation',
    title: 'Exam Preparation & Strategy Podcasts',
    description: 'Strategies and tips for acing your exams',
    keywords: [
      'GATE strategy',
      'Semester exam important topics',
      'Lab viva preparation',
      'Exam tips engineering students',
      'How to prepare for GATE',
      'Final exam preparation guide',
    ],
    color: 'green',
  },
  {
    id: 'career-guidance',
    title: 'Career Guidance & Roadmaps',
    description: 'Plan your career path with expert guidance',
    keywords: [
      'Web development roadmap',
      'AI ML roadmap',
      'Cybersecurity career guide',
      'Software engineer career path',
      'Data science roadmap',
      'Full stack developer roadmap',
    ],
    channels: ['Apna College', 'CodeWithHarry', 'Tech With Tim', 'Kunal Kushwaha'],
    color: 'orange',
  },
  {
    id: 'motivation-productivity',
    title: 'Motivation & Productivity',
    description: 'Stay motivated and boost your productivity',
    keywords: [
      'How to focus as a student',
      'Overcome procrastination',
      'Study motivation engineering students',
      'Time management for students',
      'Productivity tips for engineering',
    ],
    color: 'brown',
  },
  {
    id: 'industry-insights',
    title: 'Industry Insights',
    description: 'Real insights from the tech industry',
    keywords: [
      'Life of a software engineer',
      'FAANG interview experience',
      'Startup vs MNC explained',
      'Tech industry insights',
      'Software engineer day in life',
    ],
    color: 'red',
  },
  {
    id: 'coding-interview',
    title: 'Coding Interview Prep',
    description: 'Master coding interviews with expert tips',
    keywords: [
      'DSA interview patterns',
      'System design basics',
      'Coding interview preparation',
      'LeetCode solutions explained',
      'Technical interview tips',
    ],
    channels: ['Take U Forward', 'Tech Dosa', 'NeetCode', 'CodeStoryWithMik'],
    color: 'blue',
  },
  {
    id: 'research-innovation',
    title: 'Research & Innovation',
    description: 'Stay updated with latest research and innovations',
    keywords: [
      'AI research updates',
      'Robotics innovations',
      'Space engineering discoveries',
      'Latest technology research',
      'Engineering innovations',
    ],
    color: 'purple',
  },
  {
    id: 'soft-skills',
    title: 'Soft Skills & Communication',
    description: 'Develop essential soft skills for your career',
    keywords: [
      'How to improve English speaking',
      'GD tips engineering students',
      'Presentation skills tutorial',
      'Communication skills for engineers',
      'Public speaking tips',
    ],
    color: 'yellow',
  },
  {
    id: 'student-stories',
    title: 'Real Student Stories',
    description: 'Learn from real experiences and journeys',
    keywords: [
      'Internship stories engineering',
      'Failures to success journey',
      'Project journey vlogs',
      'Engineering student experience',
      'Campus placement stories',
    ],
    color: 'brown',
  },
  {
    id: 'entrepreneurship',
    title: 'Entrepreneurship & Startup Knowledge',
    description: 'Learn about startups and entrepreneurship',
    keywords: [
      'How to start a startup India',
      'Swiggy business model explained',
      'Build MVP step by step',
      'Startup journey India',
      'Entrepreneurship guide',
    ],
    color: 'black',
  },
  {
    id: 'mental-health',
    title: 'Mindset & Mental Health',
    description: 'Take care of your mental well-being',
    keywords: [
      'Handling engineering stress',
      'How to avoid burnout',
      'Building confidence',
      'Mental health for students',
      'Engineering student mental health',
    ],
    color: 'orange',
  },
];

