// ============================================================
// data.js — All portfolio content & file tree structure
// ============================================================

export const FILE_TREE = {
  name: 'COREY-BIRNIE-PORTFOLIO',
  type: 'root',
  open: true,
  children: [
    {
      name: 'src', type: 'folder', open: true, children: [
        {
          name: 'app', type: 'folder', open: true, children: [
            { name: 'layout.tsx', type: 'file', fileType: 'tsx', page: 'layout' },
          ]
        },
        {
          name: 'pages', type: 'folder', open: true, children: [
            { name: 'about.tsx', type: 'file', fileType: 'tsx', page: 'about' },
            { name: 'work-experience.ts', type: 'file', fileType: 'ts', page: 'experience' },
            { name: 'projects.ts', type: 'file', fileType: 'ts', page: 'projects' },
            { name: 'blogs.ts', type: 'file', fileType: 'ts', page: 'blogs' },
            { name: 'education.ts', type: 'file', fileType: 'ts', page: 'education' },
          ]
        },
        {
          name: 'components', type: 'folder', open: false, children: [
            { name: 'Header.tsx', type: 'file', fileType: 'tsx', page: 'header-component' },
            { name: 'Footer.tsx', type: 'file', fileType: 'tsx', page: 'footer-component' },
            { name: 'ProfileImage.tsx', type: 'file', fileType: 'tsx', page: 'profile-component' },
          ]
        },
        {
          name: 'data', type: 'folder', open: false, children: [
            { name: 'resume.json', type: 'file', fileType: 'json', page: 'resume-json' },
            { name: 'skills.json', type: 'file', fileType: 'json', page: 'skills-json' },
          ]
        },
      ]
    },
    {
      name: 'public', type: 'folder', open: false, children: [
        { name: 'profile.jpg', type: 'file', fileType: 'image', page: null },
      ]
    },
    { name: 'package.json', type: 'file', fileType: 'json', page: 'package-json' },
    { name: 'tsconfig.json', type: 'file', fileType: 'json', page: 'tsconfig-json' },
    { name: 'next.config.ts', type: 'file', fileType: 'ts', page: 'next-config' },
    { name: 'README.md', type: 'file', fileType: 'md', page: 'readme' },
  ]
};

// Path lookup for breadcrumbs
export const FILE_PATHS = {
  'about': 'src / pages / about.tsx',
  'experience': 'src / pages / work-experience.ts',
  'projects': 'src / pages / projects.ts',
  'blogs': 'src / pages / blogs.ts',
  'education': 'src / pages / education.ts',
  'layout': 'src / app / layout.tsx',
  'header-component': 'src / components / Header.tsx',
  'footer-component': 'src / components / Footer.tsx',
  'profile-component': 'src / components / ProfileImage.tsx',
  'resume-json': 'src / data / resume.json',
  'skills-json': 'src / data / skills.json',
  'package-json': 'package.json',
  'tsconfig-json': 'tsconfig.json',
  'next-config': 'next.config.ts',
  'readme': 'README.md',
};

// Language for status bar
export const FILE_LANGUAGES = {
  'tsx': 'TypeScript React',
  'ts': 'TypeScript',
  'json': 'JSON',
  'md': 'Markdown',
  'image': 'Image',
};

// ============================================================
// Chat messages
// ============================================================
export const CHAT_MESSAGES = [
  {
    role: 'user',
    text: 'Tell me about Corey Birnie',
  },
  {
    role: 'ai',
    text: `Corey is an Advanced Software Engineer at Worldover in London. He holds a 1st class MEng in Computer Science from Durham University.\n\nHe specializes in full-stack TypeScript/React development and AI-first product architecture. Fun fact: he went from writing embedded C/C++ for missile systems at MBDA to building AI platforms that generate entire web apps!`,
  },
  {
    role: 'user',
    text: 'What are his key technical skills?',
  },
  {
    role: 'ai',
    text: 'His core stack:',
    codeBlock: `Languages:    TypeScript, Python, SQL, Java, C++, Haskell\nTechnologies: React, Next.js, tRPC, Tailwind, React Query\nAWS:          Neptune, Amplify, S3, EC2, Lambda\nAI/ML:        PyTorch, Computer Vision, NLP, GANs`,
  },
  {
    role: 'user',
    text: "What's his most impressive achievement?",
  },
  {
    role: 'ai',
    text: `At Worldover, he led the architectural transformation of an entire platform into an "AI-first" appfactory. He also directed the QuickReview feature launch which improved customer efficiency by over 100x.\n\nHis Master's dissertation is equally impressive — he built an ML pipeline combining computer vision, NLP, and financial modeling to predict stock prices from CEO video interviews.`,
  },
];
