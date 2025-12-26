// Subject data organized by Stream -> Year -> Semester -> Subjects

export interface Subject {
  name: string;
}

export interface Semester {
  number: number;
  subjects: Subject[];
}

export interface YearData {
  year: number;
  semesters: Semester[];
}

export interface StreamData {
  stream: string;
  years: YearData[];
}

export const subjectData: Record<string, StreamData> = {
  CSE: {
    stream: 'CSE',
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { name: 'Mathematics I' },
              { name: 'Physics I / Chemistry I' },
              { name: 'Basic Electrical Engineering' },
              { name: 'Engineering Graphics / Engineering Drawing' },
              { name: 'Programming for Problem Solving (C Language)' },
              { name: 'Environmental Science' },
              { name: 'Labs (Physics / Chemistry / BEE / Programming / EG)' },
            ],
          },
          {
            number: 2,
            subjects: [
              { name: 'Mathematics II' },
              { name: 'Physics II / Chemistry II' },
              { name: 'Basic Electronics Engineering' },
              { name: 'Engineering Mechanics' },
              { name: 'Data Structures' },
              { name: 'Communication Skills' },
              { name: 'Labs (Electronics, EM, DS/OOP)' },
            ],
          },
        ],
      },
      {
        year: 2,
        semesters: [
          {
            number: 3,
            subjects: [
              { name: 'Data Structures' },
              { name: 'Digital Logic' },
              { name: 'Discrete Mathematics' },
              { name: 'OOP (Java/C++)' },
              { name: 'Computer Organization & Architecture' },
              { name: 'Operating Systems (Intro)' },
              { name: 'Labs' },
            ],
          },
          {
            number: 4,
            subjects: [
              { name: 'Design & Analysis of Algorithms' },
              { name: 'DBMS' },
              { name: 'Operating Systems (Full)' },
              { name: 'Theory of Computation' },
              { name: 'Microprocessors & Microcontrollers' },
              { name: 'Probability & Statistics' },
              { name: 'Labs' },
            ],
          },
        ],
      },
      {
        year: 3,
        semesters: [
          {
            number: 5,
            subjects: [
              { name: 'Computer Networks' },
              { name: 'Compiler Design' },
              { name: 'Web Technologies' },
              { name: 'Distributed Systems' },
              { name: 'Software Engineering' },
              { name: 'Elective I' },
              { name: 'Labs' },
            ],
          },
          {
            number: 6,
            subjects: [
              { name: 'Artificial Intelligence' },
              { name: 'Machine Learning' },
              { name: 'Computer Graphics' },
              { name: 'Data Mining / Big Data' },
              { name: 'Mobile Computing' },
              { name: 'Elective II' },
              { name: 'Mini Project' },
            ],
          },
        ],
      },
      {
        year: 4,
        semesters: [
          {
            number: 7,
            subjects: [
              { name: 'Cloud Computing / Blockchain' },
              { name: 'IoT / Cyber Security' },
              { name: 'Open Elective' },
              { name: 'Program Elective III' },
              { name: 'Major Project – Phase 1' },
              { name: 'Seminar' },
            ],
          },
          {
            number: 8,
            subjects: [
              { name: 'Internship / Training' },
              { name: 'Major Project – Phase 2' },
              { name: 'Electives (AI/ML, Cloud, DS, Security)' },
            ],
          },
        ],
      },
    ],
  },
  ECE: {
    stream: 'ECE',
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { name: 'Mathematics I' },
              { name: 'Physics I / Chemistry I' },
              { name: 'Basic Electrical Engineering' },
              { name: 'Engineering Graphics / Engineering Drawing' },
              { name: 'Programming for Problem Solving (C Language)' },
              { name: 'Environmental Science' },
              { name: 'Labs (Physics / Chemistry / BEE / Programming / EG)' },
            ],
          },
          {
            number: 2,
            subjects: [
              { name: 'Mathematics II' },
              { name: 'Physics II / Chemistry II' },
              { name: 'Basic Electronics Engineering' },
              { name: 'Engineering Mechanics' },
              { name: 'Data Structures' },
              { name: 'Communication Skills' },
              { name: 'Labs (Electronics, EM, DS/OOP)' },
            ],
          },
        ],
      },
      {
        year: 2,
        semesters: [
          {
            number: 3,
            subjects: [
              { name: 'Electronic Devices' },
              { name: 'Network Theory' },
              { name: 'Analog Circuits' },
              { name: 'Digital Electronics' },
              { name: 'Signals & Systems' },
              { name: 'Labs' },
            ],
          },
          {
            number: 4,
            subjects: [
              { name: 'Microprocessors & Microcontrollers' },
              { name: 'Communication Systems I' },
              { name: 'Linear Integrated Circuits' },
              { name: 'Electromagnetic Theory' },
              { name: 'Random Processes & Probability' },
              { name: 'Labs' },
            ],
          },
        ],
      },
      {
        year: 3,
        semesters: [
          {
            number: 5,
            subjects: [
              { name: 'Communication Systems II' },
              { name: 'Digital Signal Processing' },
              { name: 'Antenna & Wave Propagation' },
              { name: 'Control Systems' },
              { name: 'VLSI Design (Intro)' },
              { name: 'Labs' },
            ],
          },
          {
            number: 6,
            subjects: [
              { name: 'Wireless Communication' },
              { name: 'Embedded Systems' },
              { name: 'Optical Fiber Communication' },
              { name: 'VLSI Design (Advanced)' },
              { name: 'Elective I' },
              { name: 'Mini Project' },
            ],
          },
        ],
      },
      {
        year: 4,
        semesters: [
          {
            number: 7,
            subjects: [
              { name: 'Microwave Engineering' },
              { name: 'IoT & Embedded Systems' },
              { name: 'Wireless Networks' },
              { name: 'Program Elective II' },
              { name: 'Project Phase I' },
            ],
          },
          {
            number: 8,
            subjects: [
              { name: 'Satellite Communication' },
              { name: 'Advanced Elective' },
              { name: 'Internship' },
              { name: 'Project Phase II' },
              { name: 'Open Elective' },
            ],
          },
        ],
      },
    ],
  },
  Civil: {
    stream: 'Civil',
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { name: 'Mathematics I' },
              { name: 'Physics I / Chemistry I' },
              { name: 'Basic Electrical Engineering' },
              { name: 'Engineering Graphics / Engineering Drawing' },
              { name: 'Programming for Problem Solving (C Language)' },
              { name: 'Environmental Science' },
              { name: 'Labs (Physics / Chemistry / BEE / Programming / EG)' },
            ],
          },
          {
            number: 2,
            subjects: [
              { name: 'Mathematics II' },
              { name: 'Physics II / Chemistry II' },
              { name: 'Basic Electronics Engineering' },
              { name: 'Engineering Mechanics' },
              { name: 'Data Structures' },
              { name: 'Communication Skills' },
              { name: 'Labs (Electronics, EM, DS/OOP)' },
            ],
          },
        ],
      },
      {
        year: 2,
        semesters: [
          {
            number: 3,
            subjects: [
              { name: 'Strength of Materials I' },
              { name: 'Fluid Mechanics' },
              { name: 'Surveying I' },
              { name: 'Engineering Geology' },
              { name: 'Building Materials' },
              { name: 'Labs' },
            ],
          },
          {
            number: 4,
            subjects: [
              { name: 'Strength of Materials II' },
              { name: 'Concrete Technology' },
              { name: 'Structural Analysis I' },
              { name: 'Surveying II' },
              { name: 'Hydraulics & Hydraulic Machines' },
              { name: 'Labs' },
            ],
          },
        ],
      },
      {
        year: 3,
        semesters: [
          {
            number: 5,
            subjects: [
              { name: 'Structural Analysis II' },
              { name: 'Soil Mechanics' },
              { name: 'Transportation Engineering I' },
              { name: 'Water Resources Engineering I' },
              { name: 'Concrete Structures' },
              { name: 'Labs' },
            ],
          },
          {
            number: 6,
            subjects: [
              { name: 'Foundation Engineering' },
              { name: 'Steel Structures' },
              { name: 'Transportation Engineering II' },
              { name: 'Hydrology' },
              { name: 'Environmental Engineering I' },
              { name: 'Mini Project' },
            ],
          },
        ],
      },
      {
        year: 4,
        semesters: [
          {
            number: 7,
            subjects: [
              { name: 'Environmental Engineering II' },
              { name: 'Construction Management' },
              { name: 'Program Elective I' },
              { name: 'Open Elective' },
              { name: 'Major Project I' },
            ],
          },
          {
            number: 8,
            subjects: [
              { name: 'Internship' },
              { name: 'Major Project II' },
              { name: 'Elective II' },
            ],
          },
        ],
      },
    ],
  },
  Mechanical: {
    stream: 'Mechanical',
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { name: 'Mathematics I' },
              { name: 'Physics I / Chemistry I' },
              { name: 'Basic Electrical Engineering' },
              { name: 'Engineering Graphics / Engineering Drawing' },
              { name: 'Programming for Problem Solving (C Language)' },
              { name: 'Environmental Science' },
              { name: 'Labs (Physics / Chemistry / BEE / Programming / EG)' },
            ],
          },
          {
            number: 2,
            subjects: [
              { name: 'Mathematics II' },
              { name: 'Physics II / Chemistry II' },
              { name: 'Basic Electronics Engineering' },
              { name: 'Engineering Mechanics' },
              { name: 'Data Structures' },
              { name: 'Communication Skills' },
              { name: 'Labs (Electronics, EM, DS/OOP)' },
            ],
          },
        ],
      },
      {
        year: 2,
        semesters: [
          {
            number: 3,
            subjects: [
              { name: 'Engineering Thermodynamics' },
              { name: 'Strength of Materials' },
              { name: 'Kinematics of Machines' },
              { name: 'Fluid Mechanics' },
              { name: 'Manufacturing Processes I' },
              { name: 'Labs' },
            ],
          },
          {
            number: 4,
            subjects: [
              { name: 'Applied Thermodynamics' },
              { name: 'Dynamics of Machines' },
              { name: 'Heat & Mass Transfer' },
              { name: 'Manufacturing Processes II' },
              { name: 'Machine Drawing' },
              { name: 'Labs' },
            ],
          },
        ],
      },
      {
        year: 3,
        semesters: [
          {
            number: 5,
            subjects: [
              { name: 'Machine Design I' },
              { name: 'Internal Combustion Engines' },
              { name: 'Theory of Machines' },
              { name: 'Refrigeration & AC' },
              { name: 'Casting & Welding' },
              { name: 'Labs' },
            ],
          },
          {
            number: 6,
            subjects: [
              { name: 'Machine Design II' },
              { name: 'Mechatronics' },
              { name: 'Robotics' },
              { name: 'CAD/CAM' },
              { name: 'Industrial Engineering' },
              { name: 'Labs' },
            ],
          },
        ],
      },
      {
        year: 4,
        semesters: [
          {
            number: 7,
            subjects: [
              { name: 'Power Plant Engineering' },
              { name: 'Finite Element Analysis' },
              { name: 'Program Elective I' },
              { name: 'Mini Project' },
            ],
          },
          {
            number: 8,
            subjects: [
              { name: 'Internship' },
              { name: 'Major Project II' },
              { name: 'Program Elective II' },
            ],
          },
        ],
      },
    ],
  },
};

