import type { StudyNote } from './studyNotes';

// Helper function to create a study note
function createDummyNote(
  id: string,
  title: string,
  category: 'college' | 'competitive',
  subject: string,
  topics: string[],
  stream?: string,
  semester?: number
): StudyNote {
  const summary = `Comprehensive study material for ${subject}. Covers key concepts, formulas, examples, and practice questions for effective learning and exam preparation.`;
  
  const content = [
    {
      heading: 'Overview',
      content: `${subject} is an important subject that covers fundamental concepts and principles. This study material provides a comprehensive overview of key topics, concepts, and applications.`
    },
    {
      heading: 'Key Concepts',
      content: `Key concepts include understanding fundamental principles, applications, and problem-solving techniques. Important topics cover theoretical foundations and practical implementations.`
    },
    {
      heading: 'Key Formulas',
      content: `• Important formulas and equations\n• Mathematical relationships\n• Key principles and laws\n• Calculation methods`
    },
    {
      heading: 'Examples',
      content: `Example 1: Basic problem solving approach\nSolution: Step-by-step solution with detailed explanation\n\nExample 2: Advanced application\nSolution: Comprehensive solution with key insights`
    },
    {
      heading: 'Common Mistakes',
      content: `Common mistakes students make include: incorrect formula application, conceptual errors, calculation mistakes, and misunderstanding of key principles.`
    }
  ];

  const flashcards = [
    { question: `What is a key concept in ${subject}?`, answer: 'A fundamental principle that forms the basis of understanding' },
    { question: `What is the main application of ${subject}?`, answer: 'Practical use in real-world scenarios and problem-solving' },
    { question: `What should you remember about ${subject}?`, answer: 'Key formulas, concepts, and problem-solving techniques' }
  ];

  const examples = [
    { description: 'Basic example demonstrating key concepts', code: '// Code example or solution steps' },
    { description: 'Advanced example with detailed explanation', code: '// Complex problem solution' }
  ];

  const mcqs = [
    {
      question: `Which of the following is a key topic in ${subject}?`,
      options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
      answerIndex: 0,
      explanation: 'Topic A is the correct answer as it represents a fundamental concept in this subject.'
    },
    {
      question: `What is the main purpose of studying ${subject}?`,
      options: ['Understanding concepts', 'Memorizing facts', 'Passing exams', 'All of the above'],
      answerIndex: 3,
      explanation: 'Studying this subject involves understanding concepts, memorizing important facts, and preparing for examinations.'
    }
  ];

  const sources = [
    {
      url: `https://example.com/${subject.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${subject} Study Guide`,
      snippet: `Comprehensive study guide for ${subject} covering all important topics, concepts, and examples.`,
      domain: 'example.com',
      fetchedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.85 + Math.random() * 0.1
    }
  ];

  return {
    id,
    title,
    category,
    stream,
    semester,
    subject,
    topics,
    summary,
    content,
    flashcards,
    examples,
    mcqs,
    sources,
    rating: { 
      up: Math.floor(Math.random() * 30) + 5, 
      down: Math.floor(Math.random() * 3) 
    },
    meta: { 
      wordCount: 350 + Math.floor(Math.random() * 100), 
      readingTime: 2 + Math.floor(Math.random() * 2) 
    },
    visibility: 'public',
    bookmarked: false,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Generate comprehensive dummy notes for all subjects
function generateAllDummyNotes(): StudyNote[] {
  const notes: StudyNote[] = [];
  let idCounter = 1;

  // 1ST YEAR - COMMON SUBJECTS
  const firstYearSubjects = [
    { 
      sem: 1, 
      subjects: [
        'Mathematics I',
        'Physics I',
        'Chemistry I',
        'Basic Electrical Engineering',
        'Engineering Graphics',
        'Engineering Drawing',
        'Programming for Problem Solving (C Language)',
        'Environmental Science',
        'Physics Lab',
        'Chemistry Lab',
        'Basic Electrical Engineering Lab',
        'Programming Lab'
      ] 
    },
    { 
      sem: 2, 
      subjects: [
        'Mathematics II',
        'Physics II',
        'Chemistry II',
        'Basic Electronics Engineering',
        'Engineering Mechanics',
        'Data Structures (intro)',
        'Communication Skills',
        'Electronics Lab',
        'Engineering Mechanics Lab',
        'Data Structures Lab',
        'OOP Lab'
      ] 
    }
  ];

  firstYearSubjects.forEach(({ sem, subjects }) => {
    subjects.forEach(subject => {
      const topics = subject.toLowerCase().split(' ').filter(w => w.length > 3);
      notes.push(createDummyNote(
        `dummy-${idCounter++}`,
        `${subject} - Complete Study Guide`,
        'college',
        subject,
        topics,
        'Common',
        sem
      ));
    });
  });

  // CSE SUBJECTS
  const cseSubjects = {
    3: [
      'Data Structures',
      'Digital Logic',
      'Discrete Mathematics',
      'Object-Oriented Programming (C++/Java)',
      'Computer Organization & Architecture',
      'OS (Intro)'
    ],
    4: [
      'Design & Analysis of Algorithms',
      'Database Management Systems',
      'Operating Systems (Full)',
      'Theory of Computation',
      'Microprocessors & Microcontrollers',
      'Probability & Statistics'
    ],
    5: [
      'Computer Networks',
      'Compiler Design',
      'Software Engineering',
      'Distributed Systems',
      'Web Technologies',
      'Elective I'
    ],
    6: [
      'Artificial Intelligence',
      'Machine Learning',
      'Computer Graphics',
      'Data Mining',
      'Big Data',
      'Mobile Computing',
      'Elective II'
    ],
    7: [
      'Cloud Computing',
      'Blockchain',
      'IoT',
      'Cyber Security',
      'Program Elective III',
      'Open Elective',
      'Major Project Phase I'
    ],
    8: [
      'Internship',
      'Major Project Phase II',
      'Electives (AI/ML, Cloud, Security, DS, etc.)'
    ]
  };

  Object.entries(cseSubjects).forEach(([sem, subjects]) => {
    subjects.forEach(subject => {
      const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
      notes.push(createDummyNote(
        `dummy-${idCounter++}`,
        `${subject} - CSE Semester ${sem}`,
        'college',
        subject,
        topics,
        'CSE',
        parseInt(sem)
      ));
    });
  });

  // ECE SUBJECTS
  const eceSubjects = {
    3: [
      'Network Theory',
      'Electronic Devices',
      'Analog Circuits',
      'Digital Electronics',
      'Signals & Systems'
    ],
    4: [
      'Microprocessors & Microcontrollers',
      'Communication Systems – I',
      'Linear Integrated Circuits',
      'Electromagnetic Theory',
      'Random Processes & Probability'
    ],
    5: [
      'Digital Signal Processing',
      'Antenna & Wave Propagation',
      'VLSI Design (Intro)',
      'Control Systems',
      'Communication Systems – II'
    ],
    6: [
      'Wireless Communication',
      'Embedded Systems',
      'Optical Fiber Communication',
      'VLSI Design (Advanced)',
      'Elective I'
    ],
    7: [
      'Microwave Engineering',
      'IoT & Embedded Systems',
      'Wireless Networks',
      'Elective II',
      'Project Phase I'
    ],
    8: [
      'Satellite Communication',
      'Final Project',
      'Electives'
    ]
  };

  Object.entries(eceSubjects).forEach(([sem, subjects]) => {
    subjects.forEach(subject => {
      const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
      notes.push(createDummyNote(
        `dummy-${idCounter++}`,
        `${subject} - ECE Semester ${sem}`,
        'college',
        subject,
        topics,
        'ECE',
        parseInt(sem)
      ));
    });
  });

  // CIVIL ENGINEERING SUBJECTS
  const civilSubjects = {
    3: [
      'Strength of Materials I',
      'Surveying I',
      'Fluid Mechanics',
      'Engineering Geology',
      'Building Materials'
    ],
    4: [
      'Strength of Materials II',
      'Concrete Technology',
      'Structural Analysis I',
      'Surveying II',
      'Hydraulics'
    ],
    5: [
      'Soil Mechanics',
      'Transportation Engineering I',
      'Water Resources Engineering I',
      'Concrete Structures',
      'Structural Analysis II'
    ],
    6: [
      'Foundation Engineering',
      'Steel Structures',
      'Transportation Engineering II',
      'Hydrology',
      'Environmental Engineering I'
    ],
    7: [
      'Environmental Engineering II',
      'Construction Management',
      'Electives',
      'Major Project I'
    ],
    8: [
      'Internship',
      'Major Project II'
    ]
  };

  Object.entries(civilSubjects).forEach(([sem, subjects]) => {
    subjects.forEach(subject => {
      const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
      notes.push(createDummyNote(
        `dummy-${idCounter++}`,
        `${subject} - Civil Engineering Semester ${sem}`,
        'college',
        subject,
        topics,
        'Civil Engineering',
        parseInt(sem)
      ));
    });
  });

  // MECHANICAL ENGINEERING SUBJECTS
  const mechSubjects = {
    3: [
      'Thermodynamics',
      'Strength of Materials',
      'Kinematics of Machines',
      'Fluid Mechanics',
      'Manufacturing Processes I'
    ],
    4: [
      'Applied Thermodynamics',
      'Dynamics of Machines',
      'Heat & Mass Transfer',
      'Manufacturing Processes II',
      'Machine Drawing'
    ],
    5: [
      'Machine Design I',
      'IC Engines',
      'Theory of Machines',
      'Refrigeration & AC',
      'Casting & Welding'
    ],
    6: [
      'Machine Design II',
      'Mechatronics',
      'Robotics',
      'CAD/CAM',
      'Industrial Engineering'
    ],
    7: [
      'Power Plant Engineering',
      'Finite Element Analysis',
      'Program Electives',
      'Mini Project'
    ],
    8: [
      'Internship',
      'Final Project'
    ]
  };

  Object.entries(mechSubjects).forEach(([sem, subjects]) => {
    subjects.forEach(subject => {
      const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
      notes.push(createDummyNote(
        `dummy-${idCounter++}`,
        `${subject} - Mechanical Engineering Semester ${sem}`,
        'college',
        subject,
        topics,
        'Mechanical Engineering',
        parseInt(sem)
      ));
    });
  });

  // COMPETITIVE EXAMS
  // UPSC - GS Papers
  const upscGSSubjects = [
    'History',
    'Geography',
    'Polity',
    'Economy',
    'Environment',
    'Science & Technology',
    'Ethics',
    'International Relations',
    'Governance',
    'Disaster Management'
  ];
  upscGSSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `UPSC GS Paper - ${subject}`,
      'competitive',
      `UPSC ${subject}`,
      topics
    ));
  });

  // UPSC - Optional Subjects
  const upscOptionalSubjects = [
    'Geography Optional',
    'Sociology Optional',
    'PSIR',
    'Anthropology',
    'Public Administration',
    'Literature subjects'
  ];
  upscOptionalSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `UPSC Optional - ${subject}`,
      'competitive',
      `UPSC ${subject}`,
      topics
    ));
  });

  // GATE CSE
  const gateCseSubjects = [
    'Algorithms',
    'Data Structures',
    'Operating Systems',
    'DBMS',
    'Computer Networks',
    'Digital Logic',
    'Theory of Computation',
    'Compiler Design',
    'Engineering Mathematics'
  ];
  gateCseSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GATE CSE - ${subject}`,
      'competitive',
      `GATE CSE ${subject}`,
      topics
    ));
  });

  // GATE ECE
  const gateEceSubjects = [
    'Network Theory',
    'Signals & Systems',
    'Electronic Devices',
    'Communications',
    'Control Systems',
    'Electromagnetics',
    'Analog Circuits',
    'Digital Circuits'
  ];
  gateEceSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GATE ECE - ${subject}`,
      'competitive',
      `GATE ECE ${subject}`,
      topics
    ));
  });

  // GATE Mechanical
  const gateMechSubjects = [
    'Thermodynamics',
    'SOM',
    'Fluid Mechanics',
    'Heat Transfer',
    'Engineering Mechanics',
    'Manufacturing',
    'Industrial Engineering'
  ];
  gateMechSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GATE Mechanical - ${subject}`,
      'competitive',
      `GATE Mechanical ${subject}`,
      topics
    ));
  });

  // GATE Civil
  const gateCivilSubjects = [
    'Structural Engineering',
    'Geotechnical Engineering',
    'Water Resources',
    'Environmental Engineering',
    'Transportation Engineering'
  ];
  gateCivilSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GATE Civil - ${subject}`,
      'competitive',
      `GATE Civil ${subject}`,
      topics
    ));
  });

  // CAT (MBA)
  const catSubjects = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Data Interpretation',
    'Verbal Ability',
    'Reading Comprehension'
  ];
  catSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `CAT - ${subject}`,
      'competitive',
      `CAT ${subject}`,
      topics
    ));
  });

  // GRE
  const greSubjects = [
    'Verbal Reasoning',
    'Quantitative Reasoning',
    'Analytical Writing',
    'Vocabulary (Wordlist)'
  ];
  greSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GRE - ${subject}`,
      'competitive',
      `GRE ${subject}`,
      topics
    ));
  });

  // GMAT
  const gmatSubjects = [
    'Quant',
    'Verbal',
    'Integrated Reasoning',
    'Analytical Writing Assessment'
  ];
  gmatSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `GMAT - ${subject}`,
      'competitive',
      `GMAT ${subject}`,
      topics
    ));
  });

  // SSC/Banking
  const sscSubjects = ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Computer Knowledge'];
  sscSubjects.forEach(subject => {
    const topics = subject.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `SSC/Banking - ${subject}`,
      'competitive',
      `SSC/Banking ${subject}`,
      topics
    ));
  });

  // IELTS/TOEFL
  const ieltsSubjects = ['Listening', 'Reading', 'Writing', 'Speaking'];
  ieltsSubjects.forEach(subject => {
    const topics = [subject.toLowerCase()];
    notes.push(createDummyNote(
      `dummy-${idCounter++}`,
      `IELTS/TOEFL - ${subject}`,
      'competitive',
      `IELTS/TOEFL ${subject}`,
      topics
    ));
  });

  return notes;
}

// Function to get all dummy notes
export function getDummyStudyNotes(): StudyNote[] {
  return generateAllDummyNotes();
}

// Function to initialize dummy notes in localStorage
export function initializeDummyNotes(): void {
  if (typeof window === 'undefined') return;
  
  const existingNotes = localStorage.getItem('study_notes');
  if (!existingNotes || existingNotes === '[]' || JSON.parse(existingNotes).length === 0) {
    const allNotes = generateAllDummyNotes();
    localStorage.setItem('study_notes', JSON.stringify(allNotes));
  }
}

