export interface ExamCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  subcategories: ExamSubcategory[];
}

export interface ExamSubcategory {
  id: string;
  name: string;
  searchKeywords: string[];
}

export const competitiveExams: ExamCategory[] = [
  {
    id: 'upsc',
    name: 'UPSC (Civil Services)',
    description: 'Indian Administrative Services and Civil Services preparation',
    subcategories: [
      {
        id: 'ias-preparation',
        name: 'IAS Preparation',
        searchKeywords: ['UPSC IAS preparation', 'IAS exam strategy', 'UPSC civil services'],
      },
      {
        id: 'gs-paper-1',
        name: 'GS Paper 1',
        searchKeywords: ['UPSC GS Paper 1', 'General Studies Paper 1 UPSC', 'GS1 preparation'],
      },
      {
        id: 'gs-paper-2',
        name: 'GS Paper 2',
        searchKeywords: ['UPSC GS Paper 2', 'General Studies Paper 2 UPSC', 'GS2 polity'],
      },
      {
        id: 'gs-paper-3',
        name: 'GS Paper 3',
        searchKeywords: ['UPSC GS Paper 3', 'General Studies Paper 3 UPSC', 'GS3 economy'],
      },
      {
        id: 'gs-paper-4',
        name: 'GS Paper 4',
        searchKeywords: ['UPSC GS Paper 4', 'General Studies Paper 4 UPSC', 'GS4 ethics'],
      },
      {
        id: 'optional-subjects',
        name: 'Optional Subjects',
        searchKeywords: ['UPSC optional subjects', 'UPSC optional strategy', 'optional subject preparation'],
      },
      {
        id: 'current-affairs',
        name: 'Current Affairs',
        searchKeywords: ['UPSC current affairs', 'daily current affairs UPSC', 'UPSC news analysis'],
      },
    ],
  },
  {
    id: 'gate',
    name: 'GATE (Engineering)',
    description: 'Graduate Aptitude Test in Engineering',
    subcategories: [
      {
        id: 'gate-cse',
        name: 'GATE CSE',
        searchKeywords: ['GATE CSE preparation', 'GATE computer science', 'GATE CSE previous year'],
      },
      {
        id: 'gate-ece',
        name: 'GATE ECE',
        searchKeywords: ['GATE ECE preparation', 'GATE electronics', 'GATE ECE previous year'],
      },
      {
        id: 'gate-ee',
        name: 'GATE EE',
        searchKeywords: ['GATE EE preparation', 'GATE electrical engineering', 'GATE EE previous year'],
      },
      {
        id: 'gate-me',
        name: 'GATE ME',
        searchKeywords: ['GATE ME preparation', 'GATE mechanical engineering', 'GATE ME previous year'],
      },
      {
        id: 'gate-civil',
        name: 'GATE Civil',
        searchKeywords: ['GATE Civil preparation', 'GATE civil engineering', 'GATE Civil previous year'],
      },
      {
        id: 'engineering-mathematics',
        name: 'Engineering Mathematics',
        searchKeywords: ['GATE engineering mathematics', 'GATE maths preparation', 'engineering maths GATE'],
      },
      {
        id: 'previous-year-solutions',
        name: 'Previous Year Solutions',
        searchKeywords: ['GATE previous year questions', 'GATE PYQ solutions', 'GATE solved papers'],
      },
    ],
  },
  {
    id: 'cat',
    name: 'CAT (MBA Entrance)',
    description: 'Common Admission Test for MBA programs',
    subcategories: [
      {
        id: 'quantitative-aptitude',
        name: 'Quantitative Aptitude',
        searchKeywords: ['CAT Quants shortcuts', 'CAT Quant preparation', 'CAT quantitative aptitude'],
      },
      {
        id: 'logical-reasoning',
        name: 'Logical Reasoning',
        searchKeywords: ['CAT logical reasoning', 'CAT LR preparation', 'CAT reasoning tricks'],
      },
      {
        id: 'verbal-ability',
        name: 'Verbal Ability',
        searchKeywords: ['CAT verbal ability', 'CAT VARC preparation', 'CAT English'],
      },
      {
        id: 'data-interpretation',
        name: 'DI (Data Interpretation)',
        searchKeywords: ['CAT DI preparation', 'CAT data interpretation', 'CAT DI tricks'],
      },
    ],
  },
  {
    id: 'gre',
    name: 'GRE',
    description: 'Graduate Record Examination',
    subcategories: [
      {
        id: 'verbal-reasoning',
        name: 'Verbal Reasoning',
        searchKeywords: ['GRE verbal reasoning', 'GRE verbal preparation', 'GRE vocabulary'],
      },
      {
        id: 'quantitative-reasoning',
        name: 'Quantitative Reasoning',
        searchKeywords: ['GRE quantitative reasoning', 'GRE quant preparation', 'GRE maths'],
      },
      {
        id: 'analytical-writing',
        name: 'Analytical Writing',
        searchKeywords: ['GRE analytical writing', 'GRE AWA preparation', 'GRE essay writing'],
      },
      {
        id: 'vocabulary-sessions',
        name: 'Vocabulary Sessions',
        searchKeywords: ['GRE vocabulary', 'GRE word list', 'GRE vocab tricks'],
      },
    ],
  },
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'Graduate Management Admission Test',
    subcategories: [
      {
        id: 'integrated-reasoning',
        name: 'Integrated Reasoning',
        searchKeywords: ['GMAT integrated reasoning', 'GMAT IR preparation', 'GMAT IR tricks'],
      },
      {
        id: 'analytical-writing',
        name: 'Analytical Writing',
        searchKeywords: ['GMAT analytical writing', 'GMAT AWA preparation', 'GMAT essay'],
      },
      {
        id: 'quant',
        name: 'Quant',
        searchKeywords: ['GMAT quant preparation', 'GMAT quantitative', 'GMAT maths'],
      },
      {
        id: 'verbal',
        name: 'Verbal',
        searchKeywords: ['GMAT verbal preparation', 'GMAT verbal reasoning', 'GMAT SC CR'],
      },
    ],
  },
  {
    id: 'other',
    name: 'Other Exam Categories',
    description: 'Additional competitive exams',
    subcategories: [
      {
        id: 'ssc',
        name: 'SSC',
        searchKeywords: ['SSC preparation', 'SSC CGL', 'SSC exam strategy'],
      },
      {
        id: 'bank-po',
        name: 'Bank PO',
        searchKeywords: ['Bank PO preparation', 'Bank PO exam', 'Banking exam preparation'],
      },
      {
        id: 'defence-exams',
        name: 'Defence Exams',
        searchKeywords: ['NDA preparation', 'CDS exam', 'defence exam preparation'],
      },
      {
        id: 'ielts-toefl',
        name: 'IELTS / TOEFL',
        searchKeywords: ['IELTS preparation', 'TOEFL preparation', 'IELTS speaking', 'TOEFL listening'],
      },
      {
        id: 'je-ae-engineering',
        name: 'JE / AE Engineering Exams',
        searchKeywords: ['JE exam preparation', 'AE engineering exam', 'junior engineer exam'],
      },
    ],
  },
];

