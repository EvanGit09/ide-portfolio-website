// ============================================================
// renderer.js — Converts content data → syntax-highlighted HTML
// ============================================================

// Syntax helpers — wrap text in colored spans
const kw = (t) => `<span class="kw">${t}</span>`;
const fn = (t) => `<span class="fn">${t}</span>`;
const str = (t) => `<span class="str">${t}</span>`;
const num = (t) => `<span class="num">${t}</span>`;
const type = (t) => `<span class="type">${t}</span>`;
const cm = (t) => `<span class="cm">${t}</span>`;
const op = (t) => `<span class="op">${t}</span>`;
const prop = (t) => `<span class="prop">${t}</span>`;
const tag = (t) => `<span class="tag">${t}</span>`;
const attr = (t) => `<span class="attr">${t}</span>`;
const param = (t) => `<span class="param">${t}</span>`;
const b1 = (t) => `<span class="bracket-1">${t}</span>`;
const b2 = (t) => `<span class="bracket-2">${t}</span>`;
const b3 = (t) => `<span class="bracket-3">${t}</span>`;

// Backtick constant — can't use literal backtick inside template literals
const BT = '\u0060';

// Indent helper
const ind = (n) => '  '.repeat(n);

// Escape HTML
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ============================================================
// Page renderers — each returns an array of HTML line strings
// ============================================================

export function renderAbout() {
  return [
    `${cm('// about.tsx — Corey Birnie\'s Portfolio')}`,
    `${cm('// Advanced Software Engineer | London, UK')}`,
    ``,
    `${kw('import')} ${type('React')} ${kw('from')} ${str("'react'")}${op(';')}`,
    `${kw('import')} ${b1('{')} ${type('ProfileImage')} ${b1('}')} ${kw('from')} ${str("'../components/ProfileImage'")}${op(';')}`,
    `${kw('import')} ${b1('{')} ${type('SkillBadge')} ${b1('}')} ${kw('from')} ${str("'../components/SkillBadge'")}${op(';')}`,
    ``,
    `${kw('interface')} ${type('AboutProps')} ${b1('{')}`,
    `${ind(1)}${prop('name')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('title')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('location')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('bio')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('skills')}${op(':')} ${type('Record')}${op('&lt;')}${type('string')}${op(',')} ${type('string')}${op('[]&gt;')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('const')} ${fn('About')}${op(':')} ${type('React.FC')}${op('&lt;')}${type('AboutProps')}${op('&gt;')} ${op('=')} ${b1('(')}${b1(')')} ${op('=>')} ${b1('{')}`,
    `${ind(1)}${kw('const')} ${prop('name')} ${op('=')} ${str('"Corey Birnie"')}${op(';')}`,
    `${ind(1)}${kw('const')} ${prop('title')} ${op('=')} ${str('"Advanced Software Engineer"')}${op(';')}`,
    `${ind(1)}${kw('const')} ${prop('location')} ${op('=')} ${str('"London, UK"')}${op(';')}`,
    ``,
    `${ind(1)}${kw('const')} ${prop('bio')} ${op('=')} ${str(BT)}`,
    `${ind(2)}${str("I'm an Advanced Software Engineer at Worldover, where I lead")}`,
    `${ind(2)}${str("the architectural transformation of a legacy platform into an")}`,
    `${ind(2)}${str('"AI-first" appfactory — enabling automated generation of bespoke')}`,
    `${ind(2)}${str("client web apps. I hold a 1st class MEng in Computer Science")}`,
    `${ind(2)}${str("from Durham University and have experience spanning full-stack")}`,
    `${ind(2)}${str("web development, AI/ML, embedded systems, and fintech.")}`,
    `${ind(1)}${str(BT)}${op(';')}`,
    ``,
    `${ind(1)}${kw('const')} ${prop('skills')}${op(':')} ${type('Record')}${op('&lt;')}${type('string')}${op(',')} ${type('string')}${op('[]&gt;')} ${op('=')} ${b1('{')}`,
    `${ind(2)}${prop('Languages')}${op(':')} ${b2('[')}`,
    `${ind(3)}${str('"TypeScript/JavaScript"')}${op(',')} ${str('"Python"')}${op(',')} ${str('"Gremlin"')}${op(',')}`,
    `${ind(3)}${str('"SQL"')}${op(',')} ${str('"Java"')}${op(',')} ${str('"C++"')}${op(',')} ${str('"Motoko"')}${op(',')} ${str('"Haskell"')}`,
    `${ind(2)}${b2(']')}${op(',')}`,
    `${ind(2)}${prop('Technologies')}${op(':')} ${b2('[')}`,
    `${ind(3)}${str('"React"')}${op(',')} ${str('"Next.js"')}${op(',')} ${str('"tRPC"')}${op(',')} ${str('"Zod"')}${op(',')}`,
    `${ind(3)}${str('"Tailwind CSS"')}${op(',')} ${str('"React Query"')}${op(',')} ${str('"Git"')}${op(',')}`,
    `${ind(3)}${str('"Linux"')}${op(',')} ${str('"Machine Learning"')}${op(',')} ${str('"PyTorch"')}${op(',')}`,
    `${ind(3)}${str('"ThreeJS"')}${op(',')} ${str('"MCP"')}`,
    `${ind(2)}${b2(']')}${op(',')}`,
    `${ind(2)}${prop('AWS')}${op(':')} ${b2('[')}`,
    `${ind(3)}${str('"Neptune"')}${op(',')} ${str('"Amplify"')}${op(',')} ${str('"S3"')}${op(',')}`,
    `${ind(3)}${str('"EC2"')}${op(',')} ${str('"OpenSearch"')}${op(',')} ${str('"Lambda"')}`,
    `${ind(2)}${b2(']')}${op(',')}`,
    `${ind(1)}${b1('}')}${op(';')}`,
    ``,
    `${ind(1)}${kw('return')} ${b1('(')}`,
    `${ind(2)}${tag('&lt;section')} ${attr('className')}${op('=')}${str('"about-page"')}${tag('&gt;')}`,
    `${ind(3)}${tag('&lt;ProfileImage')} ${attr('src')}${op('=')}${str('"/profile.jpg"')} ${attr('alt')}${op('=')}${str('"Corey Birnie"')} ${tag('/&gt;')}`,
    `${ind(3)}${tag('&lt;h1&gt;')}${op('{')}${prop('name')}${op('}')}${tag('&lt;/h1&gt;')}`,
    `${ind(3)}${tag('&lt;h2&gt;')}${op('{')}${prop('title')}${op('}')} ${str('—')} ${op('{')}${prop('location')}${op('}')}${tag('&lt;/h2&gt;')}`,
    `${ind(3)}${tag('&lt;p&gt;')}${op('{')}${prop('bio')}${op('}')}${tag('&lt;/p&gt;')}`,
    ``,
    `${ind(3)}${tag('&lt;div')} ${attr('className')}${op('=')}${str('"skills-grid"')}${tag('&gt;')}`,
    `${ind(4)}${op('{')}${type('Object')}${op('.')}${fn('entries')}${b2('(')}${prop('skills')}${b2(')')}${op('.')}${fn('map')}${b2('(')}${b3('(')}${op('[')}${param('category')}${op(',')} ${param('items')}${op(']')}${b3(')')} ${op('=>')} ${b3('(')}`,
    `${ind(5)}${tag('&lt;div')} ${attr('key')}${op('=')}${op('{')}${param('category')}${op('}')} ${attr('className')}${op('=')}${str('"skill-category"')}${tag('&gt;')}`,
    `${ind(6)}${tag('&lt;h3&gt;')}${op('{')}${param('category')}${op('}')}${tag('&lt;/h3&gt;')}`,
    `${ind(6)}${tag('&lt;div')} ${attr('className')}${op('=')}${str('"skill-tags"')}${tag('&gt;')}`,
    `${ind(7)}${op('{')}${param('items')}${op('.')}${fn('map')}${b2('(')}${param('skill')} ${op('=>')} ${b2('(')}`,
    `${ind(8)}${tag('&lt;SkillBadge')} ${attr('key')}${op('=')}${op('{')}${param('skill')}${op('}')} ${attr('label')}${op('=')}${op('{')}${param('skill')}${op('}')} ${tag('/&gt;')}`,
    `${ind(7)}${b2(')')}${b2(')')}${op('}')}`,
    `${ind(6)}${tag('&lt;/div&gt;')}`,
    `${ind(5)}${tag('&lt;/div&gt;')}`,
    `${ind(4)}${b3(')')}${b2(')')}${op('}')}`,
    `${ind(3)}${tag('&lt;/div&gt;')}`,
    `${ind(2)}${tag('&lt;/section&gt;')}`,
    `${ind(1)}${b1(')')}${op(';')}`,
    `${b1('}')}${op(';')}`,
    ``,
    `${kw('export')} ${kw('default')} ${fn('About')}${op(';')}`,
  ];
}

export function renderExperience() {
  return [
    `${cm('// work-experience.ts — Professional Experience')}`,
    `${cm('// Corey Birnie\'s career history')}`,
    ``,
    `${kw('interface')} ${type('WorkExperience')} ${b1('{')}`,
    `${ind(1)}${prop('company')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('title')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('period')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('location')}${op('?:')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('highlights')}${op(':')} ${type('string')}${op('[]')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${prop('experiences')}${op(':')} ${type('WorkExperience')}${op('[]')} ${op('=')} ${b1('[')}`,
    ``,
    `${ind(1)}${cm('// ─── Worldover ───────────────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('company')}${op(':')} ${str('"Worldover"')}${op(',')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Advanced Software Engineer"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"January 2026 — Present"')}${op(',')}`,
    `${ind(2)}${prop('location')}${op(':')} ${str('"London, UK"')}${op(',')}`,
    `${ind(2)}${prop('highlights')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Headed a team through the architectural transformation of a legacy"')}${op(',')}`,
    `${ind(3)}${str('"platform into an \'AI-first\' appfactory, enabling automated"')}${op(',')}`,
    `${ind(3)}${str('"generation of bespoke client web apps"')}${op(',')}`,
    `${ind(3)}${str('"Directed team to architect and launch \'QuickReview\', a flagship"')}${op(',')}`,
    `${ind(3)}${str('"greenfield AI feature — 100x customer efficiency improvement"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('company')}${op(':')} ${str('"Worldover"')}${op(',')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Full-Stack Software Engineer"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"August 2024 — January 2026"')}${op(',')}`,
    `${ind(2)}${prop('highlights')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Built an AI-powered formulation system integrating an ensemble"')}${op(',')}`,
    `${ind(3)}${str('"of AI models, enabling users to generate cosmetic formulations"')}${op(',')}`,
    `${ind(3)}${str('"from simple prompts"')}${op(',')}`,
    `${ind(3)}${str('"Implemented an MCP server on the platform API during personal"')}${op(',')}`,
    `${ind(3)}${str('"time — foundation for AI agent-based features across the platform"')}${op(',')}`,
    `${ind(3)}${str('"Mentored new engineers, managing their task progression"')}${op(',')}`,
    `${ind(3)}${str('"Engineered core platform architecture as an early-stage hire,"')}${op(',')}`,
    `${ind(3)}${str('"driving evolution from foundational stages to production"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── Citigroup ──────────────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('company')}${op(':')} ${str('"Citigroup"')}${op(',')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Software Engineer Intern"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"June 2023 — August 2023"')}${op(',')}`,
    `${ind(2)}${prop('highlights')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Analysed feature bias in predictive ML models for loan"')}${op(',')}`,
    `${ind(3)}${str('"acceptance using Python and Tableau"')}${op(',')}`,
    `${ind(3)}${str('"Developed PL/SQL scripts for compliance features and Java"')}${op(',')}`,
    `${ind(3)}${str('"automation on updated systems"')}${op(',')}`,
    `${ind(3)}${str('"Received mentorship in quantitative analysis and algorithms"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── Durham University ──────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('company')}${op(':')} ${str('"Durham University"')}${op(',')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Demonstrator / Teaching Assistant"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"September 2022 — June 2024"')}${op(',')}`,
    `${ind(2)}${prop('highlights')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Led and taught groups of 30 first and second-year students"')}${op(',')}`,
    `${ind(3)}${str('"in practical programming and AI modules"')}${op(',')}`,
    `${ind(3)}${str('"Developed skills in communicating complex concepts clearly"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── MBDA ───────────────────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('company')}${op(':')} ${str('"MBDA"')}${op(',')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Software Engineer Intern"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"June 2021 — August 2021"')}${op(',')}`,
    `${ind(2)}${prop('highlights')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Developed embedded real-time systems using C/C++ with high"')}${op(',')}`,
    `${ind(3)}${str('"security and reliability standards"')}${op(',')}`,
    `${ind(3)}${str('"Implemented static analysis tooling, configured build systems,"')}${op(',')}`,
    `${ind(3)}${str('"wrote unit tests in C++ and Python"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${b1(']')}${op(';')}`,
  ];
}

export function renderProjects() {
  return [
    `${cm('// projects.ts — Notable Projects')}`,
    `${cm('// A selection of significant technical work')}`,
    ``,
    `${kw('interface')} ${type('Project')} ${b1('{')}`,
    `${ind(1)}${prop('title')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('subtitle')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('description')}${op(':')} ${type('string')}${op('[]')}${op(';')}`,
    `${ind(1)}${prop('tech')}${op(':')} ${type('string')}${op('[]')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${prop('projects')}${op(':')} ${type('Project')}${op('[]')} ${op('=')} ${b1('[')}`,
    ``,
    `${ind(1)}${cm('// ─── Master\'s Dissertation ──────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Detecting CEO Behaviour from Video Interviews via ML"')}${op(',')}`,
    `${ind(2)}${prop('subtitle')}${op(':')} ${str('"Master\'s Dissertation — Durham University"')}${op(',')}`,
    `${ind(2)}${prop('description')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Employed advanced computer vision techniques with machine"')}${op(',')}`,
    `${ind(3)}${str('"learning models for precise facial expression detection"')}${op(',')}`,
    `${ind(3)}${str('"Integrated facial expression data with head position, eye"')}${op(',')}`,
    `${ind(3)}${str('"movement, and NLP data into a tailored ML model to accurately"')}${op(',')}`,
    `${ind(3)}${str('"forecast future stock prices"')}${op(',')}`,
    `${ind(3)}${str('"Deployed a multi-modal approach to improve forecasting accuracy"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('tech')}${op(':')} ${b3('[')}${str('"Python"')}${op(',')} ${str('"PyTorch"')}${op(',')} ${str('"Computer Vision"')}${op(',')} ${str('"NLP"')}${op(',')} ${str('"ML"')}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── Blockchain Ticketing ────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Ticketing System on the IC Blockchain"')}${op(',')}`,
    `${ind(2)}${prop('subtitle')}${op(':')} ${str('"Start-up Venture — Decentralised Ticketing"')}${op(',')}`,
    `${ind(2)}${prop('description')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Pivotal role in a start-up developing blockchain-based"')}${op(',')}`,
    `${ind(3)}${str('"ticketing with React frontend and Motoko backend"')}${op(',')}`,
    `${ind(3)}${str('"Built form manager to automate event onboarding process"')}${op(',')}`,
    `${ind(3)}${str('"Implemented dynamic NFT minting for secure QR code tickets,"')}${op(',')}`,
    `${ind(3)}${str('"enhancing fraud prevention and user experience"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('tech')}${op(':')} ${b3('[')}${str('"React"')}${op(',')} ${str('"Motoko"')}${op(',')} ${str('"Internet Computer"')}${op(',')} ${str('"NFTs"')}${op(',')} ${str('"Web3"')}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── GAN Image Generation ────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Novel GAN for Image Synthesis"')}${op(',')}`,
    `${ind(2)}${prop('subtitle')}${op(':')} ${str('"Generative Adversarial Network — From Scratch"')}${op(',')}`,
    `${ind(2)}${prop('description')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"Constructed a novel GAN from scratch, capable of generating"')}${op(',')}`,
    `${ind(3)}${str('"coherent images from random noise inputs"')}${op(',')}`,
    `${ind(3)}${str('"Built with PyTorch, demonstrating proficiency in advanced ML"')}${op(',')}`,
    `${ind(3)}${str('"Integrated concepts from diverse research to achieve"')}${op(',')}`,
    `${ind(3)}${str('"state-of-the-art performance in image generation"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('tech')}${op(':')} ${b3('[')}${str('"Python"')}${op(',')} ${str('"PyTorch"')}${op(',')} ${str('"GANs"')}${op(',')} ${str('"Deep Learning"')}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${b1(']')}${op(';')}`,
  ];
}

export function renderBlogs() {
  return [
    `${cm('// blogs.ts — Blog Posts')}`,
    `${cm('// Thoughts on engineering, AI, and building things')}`,
    ``,
    `${kw('interface')} ${type('BlogPost')} ${b1('{')}`,
    `${ind(1)}${prop('title')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('date')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('excerpt')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('slug')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('tags')}${op(':')} ${type('string')}${op('[]')}${op(';')}`,
    `${ind(1)}${prop('readTime')}${op(':')} ${type('string')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${prop('blogPosts')}${op(':')} ${type('BlogPost')}${op('[]')} ${op('=')} ${b1('[')}`,
    ``,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Building an AI-First Platform: Lessons from the Trenches"')}${op(',')}`,
    `${ind(2)}${prop('date')}${op(':')} ${str('"2026-03-15"')}${op(',')}`,
    `${ind(2)}${prop('excerpt')}${op(':')} ${str('"How we transformed a legacy platform into an AI-powered"')}${op(',')}`,
    `${ind(2)}${cm('// appfactory — the architectural decisions, trade-offs,')}`,
    `${ind(2)}${cm('// and lessons learned along the way.')}`,
    `${ind(2)}${prop('slug')}${op(':')} ${str('"ai-first-platform-lessons"')}${op(',')}`,
    `${ind(2)}${prop('tags')}${op(':')} ${b3('[')}${str('"AI"')}${op(',')} ${str('"Architecture"')}${op(',')} ${str('"TypeScript"')}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('readTime')}${op(':')} ${str('"8 min read"')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"Why I Implemented an MCP Server (And You Should Too)"')}${op(',')}`,
    `${ind(2)}${prop('date')}${op(':')} ${str('"2026-02-01"')}${op(',')}`,
    `${ind(2)}${prop('excerpt')}${op(':')} ${str('"The Model Context Protocol is changing how AI agents"')}${op(',')}`,
    `${ind(2)}${cm('// interact with platforms. Here\'s why I built one in my spare')}`,
    `${ind(2)}${cm('// time and how it became the foundation for our AI features.')}`,
    `${ind(2)}${prop('slug')}${op(':')} ${str('"mcp-server-implementation"')}${op(',')}`,
    `${ind(2)}${prop('tags')}${op(':')} ${b3('[')}${str('"MCP"')}${op(',')} ${str('"AI Agents"')}${op(',')} ${str('"API Design"')}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('readTime')}${op(':')} ${str('"6 min read"')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('title')}${op(':')} ${str('"From GANs to Production ML: A Journey"')}${op(',')}`,
    `${ind(2)}${prop('date')}${op(':')} ${str('"2025-11-10"')}${op(',')}`,
    `${ind(2)}${prop('excerpt')}${op(':')} ${str('"Reflecting on the path from building a novel GAN for"')}${op(',')}`,
    `${ind(2)}${cm('// my university project to applying ML techniques in')}`,
    `${ind(2)}${cm('// production environments at scale.')}`,
    `${ind(2)}${prop('slug')}${op(':')} ${str('"gans-to-production-ml"')}${op(',')}`,
    `${ind(2)}${prop('tags')}${op(':')} ${b3('[')}${str('"Machine Learning"')}${op(',')} ${str('"PyTorch"')}${op(',')} ${str('"GANs"')}${b3(']')}${op(',')}`,
    `${ind(2)}${prop('readTime')}${op(':')} ${str('"10 min read"')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${b1(']')}${op(';')}`,
  ];
}

export function renderEducation() {
  return [
    `${cm('// education.ts — Academic Background')}`,
    ``,
    `${kw('interface')} ${type('Education')} ${b1('{')}`,
    `${ind(1)}${prop('institution')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('degree')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('period')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('grade')}${op('?:')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('honours')}${op('?:')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('scholarship')}${op('?:')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('activities')}${op('?:')} ${type('string')}${op('[]')}${op(';')}`,
    `${ind(1)}${prop('subjects')}${op('?:')} ${type('Record')}${op('&lt;')}${type('string')}${op(',')} ${type('string')}${op('&gt;')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${prop('education')}${op(':')} ${type('Education')}${op('[]')} ${op('=')} ${b1('[')}`,
    ``,
    `${ind(1)}${cm('// ─── Durham University ──────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('institution')}${op(':')} ${str('"Durham University"')}${op(',')}`,
    `${ind(2)}${prop('degree')}${op(':')} ${str('"MEng Computer Science"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"September 2020 — June 2024"')}${op(',')}`,
    `${ind(2)}${prop('grade')}${op(':')} ${str('"1st Class Honours"')}${op(',')}`,
    `${ind(2)}${prop('scholarship')}${op(':')} ${str('"Durham Inspired Scholarship Recipient"')}${op(',')}`,
    `${ind(2)}${prop('activities')}${op(':')} ${b3('[')}`,
    `${ind(3)}${str('"DU Computing Society"')}${op(',')}`,
    `${ind(3)}${str('"Durhack (Hackathon)"')}${op(',')}`,
    `${ind(3)}${str('"Grey College Boat Club"')}${op(',')}`,
    `${ind(3)}${str('"DU Brazilian Jiu Jitsu"')}${op(',')}`,
    `${ind(3)}${str('"DU Lifting Club"')}${op(',')}`,
    `${ind(2)}${b3(']')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${ind(1)}${cm('// ─── A-Levels ───────────────────────────────────────────')}`,
    `${ind(1)}${b2('{')}`,
    `${ind(2)}${prop('institution')}${op(':')} ${str('"New College Doncaster"')}${op(',')}`,
    `${ind(2)}${prop('degree')}${op(':')} ${str('"A-Levels"')}${op(',')}`,
    `${ind(2)}${prop('period')}${op(':')} ${str('"September 2018 — June 2020"')}${op(',')}`,
    `${ind(2)}${prop('subjects')}${op(':')} ${b3('{')}`,
    `${ind(3)}${str('"Mathematics"')}${op(':')} ${str('"A*"')}${op(',')}`,
    `${ind(3)}${str('"Computer Science"')}${op(':')} ${str('"A*"')}${op(',')}`,
    `${ind(3)}${str('"Physics"')}${op(':')} ${str('"A"')}${op(',')}`,
    `${ind(3)}${str('"AS Chemistry"')}${op(':')} ${str('"B"')}${op(',')}`,
    `${ind(2)}${b3('}')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    ``,
    `${b1(']')}${op(';')}`,
  ];
}

// ============================================================
// Decorative file renderers
// ============================================================

export function renderPackageJson() {
  return [
    `${b1('{')}`,
    `${ind(1)}${str('"name"')}${op(':')} ${str('"corey-birnie-portfolio"')}${op(',')}`,
    `${ind(1)}${str('"version"')}${op(':')} ${str('"1.0.0"')}${op(',')}`,
    `${ind(1)}${str('"private"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(1)}${str('"scripts"')}${op(':')} ${b2('{')}`,
    `${ind(2)}${str('"dev"')}${op(':')} ${str('"next dev"')}${op(',')}`,
    `${ind(2)}${str('"build"')}${op(':')} ${str('"next build"')}${op(',')}`,
    `${ind(2)}${str('"start"')}${op(':')} ${str('"next start"')}${op(',')}`,
    `${ind(2)}${str('"lint"')}${op(':')} ${str('"next lint"')}${op(',')}`,
    `${ind(2)}${str('"test"')}${op(':')} ${str('"vitest"')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    `${ind(1)}${str('"dependencies"')}${op(':')} ${b2('{')}`,
    `${ind(2)}${str('"next"')}${op(':')} ${str('"15.2.4"')}${op(',')}`,
    `${ind(2)}${str('"react"')}${op(':')} ${str('"^19.1.0"')}${op(',')}`,
    `${ind(2)}${str('"react-dom"')}${op(':')} ${str('"^19.1.0"')}${op(',')}`,
    `${ind(2)}${str('"typescript"')}${op(':')} ${str('"^5.7.0"')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    `${ind(1)}${str('"devDependencies"')}${op(':')} ${b2('{')}`,
    `${ind(2)}${str('"@tailwindcss/postcss"')}${op(':')} ${str('"^4.0.0"')}${op(',')}`,
    `${ind(2)}${str('"tailwindcss"')}${op(':')} ${str('"^4.0.0"')}${op(',')}`,
    `${ind(2)}${str('"vitest"')}${op(':')} ${str('"^4.1.0"')}${op(',')}`,
    `${ind(2)}${str('"@playwright/test"')}${op(':')} ${str('"^1.59.0"')}${op(',')}`,
    `${ind(2)}${str('"eslint"')}${op(':')} ${str('"^9.0.0"')}${op(',')}`,
    `${ind(2)}${str('"prettier"')}${op(':')} ${str('"^3.0.0"')}`,
    `${ind(1)}${b2('}')}`,
    `${b1('}')}`,
  ];
}

export function renderTsConfig() {
  return [
    `${b1('{')}`,
    `${ind(1)}${str('"compilerOptions"')}${op(':')} ${b2('{')}`,
    `${ind(2)}${str('"target"')}${op(':')} ${str('"ES2017"')}${op(',')}`,
    `${ind(2)}${str('"lib"')}${op(':')} ${b3('[')}${str('"dom"')}${op(',')} ${str('"dom.iterable"')}${op(',')} ${str('"esnext"')}${b3(']')}${op(',')}`,
    `${ind(2)}${str('"allowJs"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"skipLibCheck"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"strict"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"noEmit"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"esModuleInterop"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"module"')}${op(':')} ${str('"esnext"')}${op(',')}`,
    `${ind(2)}${str('"moduleResolution"')}${op(':')} ${str('"bundler"')}${op(',')}`,
    `${ind(2)}${str('"resolveJsonModule"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"isolatedModules"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"jsx"')}${op(':')} ${str('"preserve"')}${op(',')}`,
    `${ind(2)}${str('"incremental"')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(2)}${str('"plugins"')}${op(':')} ${b3('[')}${b1('{')} ${str('"name"')}${op(':')} ${str('"next"')} ${b1('}')}${b3(']')}${op(',')}`,
    `${ind(2)}${str('"paths"')}${op(':')} ${b3('{')}`,
    `${ind(3)}${str('"@/*"')}${op(':')} ${b1('[')}${str('"./src/*"')}${b1(']')}`,
    `${ind(2)}${b3('}')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    `${ind(1)}${str('"include"')}${op(':')} ${b2('[')}${str('"next-env.d.ts"')}${op(',')} ${str('"**/*.ts"')}${op(',')} ${str('"**/*.tsx"')}${b2(']')}${op(',')}`,
    `${ind(1)}${str('"exclude"')}${op(':')} ${b2('[')}${str('"node_modules"')}${b2(']')}`,
    `${b1('}')}`,
  ];
}

export function renderNextConfig() {
  return [
    `${kw('import')} ${type('type')} ${b1('{')} ${type('NextConfig')} ${b1('}')} ${kw('from')} ${str("'next'")}${op(';')}`,
    ``,
    `${kw('const')} ${prop('nextConfig')}${op(':')} ${type('NextConfig')} ${op('=')} ${b1('{')}`,
    `${ind(1)}${prop('reactStrictMode')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(1)}${prop('images')}${op(':')} ${b2('{')}`,
    `${ind(2)}${prop('unoptimized')}${op(':')} ${num('true')}${op(',')}`,
    `${ind(1)}${b2('}')}${op(',')}`,
    `${b1('}')}${op(';')}`,
    ``,
    `${kw('export')} ${kw('default')} ${prop('nextConfig')}${op(';')}`,
  ];
}

export function renderLayout() {
  return [
    `${cm('// layout.tsx — Root Layout')}`,
    ``,
    `${kw('import')} ${type('type')} ${b1('{')} ${type('Metadata')} ${b1('}')} ${kw('from')} ${str("'next'")}${op(';')}`,
    `${kw('import')} ${str("'./globals.css'")}${op(';')}`,
    ``,
    `${kw('export')} ${kw('const')} ${prop('metadata')}${op(':')} ${type('Metadata')} ${op('=')} ${b1('{')}`,
    `${ind(1)}${prop('title')}${op(':')} ${str("'Corey Birnie — Portfolio'")}${op(',')}`,
    `${ind(1)}${prop('description')}${op(':')} ${str("'Advanced Software Engineer | London'")}${op(',')}`,
    `${b1('}')}${op(';')}`,
    ``,
    `${kw('export')} ${kw('default')} ${kw('function')} ${fn('RootLayout')}${b1('(')}${b2('{')}`,
    `${ind(1)}${param('children')}${op(',')}`,
    `${b2('}')}${op(':')} ${b2('{')} ${prop('children')}${op(':')} ${type('React.ReactNode')} ${b2('}')}${b1(')')} ${b1('{')}`,
    `${ind(1)}${kw('return')} ${b2('(')}`,
    `${ind(2)}${tag('&lt;html')} ${attr('lang')}${op('=')}${str('"en"')}${tag('&gt;')}`,
    `${ind(3)}${tag('&lt;body&gt;')}`,
    `${ind(4)}${op('{')}${param('children')}${op('}')}`,
    `${ind(3)}${tag('&lt;/body&gt;')}`,
    `${ind(2)}${tag('&lt;/html&gt;')}`,
    `${ind(1)}${b2(')')}${op(';')}`,
    `${b1('}')}`,
  ];
}

export function renderHeaderComponent() {
  return [
    `${cm('// Header.tsx — Site Header Component')}`,
    ``,
    `${kw('import')} ${type('React')} ${kw('from')} ${str("'react'")}${op(';')}`,
    ``,
    `${kw('interface')} ${type('HeaderProps')} ${b1('{')}`,
    `${ind(1)}${prop('title')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('subtitle')}${op('?:')} ${type('string')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${fn('Header')}${op(':')} ${type('React.FC')}${op('&lt;')}${type('HeaderProps')}${op('&gt;')} ${op('=')} ${b1('(')}${b2('{')} ${param('title')}${op(',')} ${param('subtitle')} ${b2('}')}${b1(')')} ${op('=>')} ${b1('(')}`,
    `${ind(1)}${tag('&lt;header')} ${attr('className')}${op('=')}${str('"site-header"')}${tag('&gt;')}`,
    `${ind(2)}${tag('&lt;h1&gt;')}${op('{')}${param('title')}${op('}')}${tag('&lt;/h1&gt;')}`,
    `${ind(2)}${op('{')}${param('subtitle')} ${op('&&')} ${tag('&lt;p&gt;')}${op('{')}${param('subtitle')}${op('}')}${tag('&lt;/p&gt;')}${op('}')}`,
    `${ind(1)}${tag('&lt;/header&gt;')}`,
    `${b1(')')}${op(';')}`,
  ];
}

export function renderFooterComponent() {
  return [
    `${cm('// Footer.tsx — Site Footer Component')}`,
    ``,
    `${kw('import')} ${type('React')} ${kw('from')} ${str("'react'")}${op(';')}`,
    ``,
    `${kw('export')} ${kw('const')} ${fn('Footer')}${op(':')} ${type('React.FC')} ${op('=')} ${b1('(')}${b1(')')} ${op('=>')} ${b1('(')}`,
    `${ind(1)}${tag('&lt;footer')} ${attr('className')}${op('=')}${str('"site-footer"')}${tag('&gt;')}`,
    `${ind(2)}${tag('&lt;p&gt;')}`,
    `${ind(3)}© ${b2('{')}${kw('new')} ${type('Date')}${b3('(')}${b3(')')}${op('.')}${fn('getFullYear')}${b3('(')}${b3(')')}${b2('}')} Corey Birnie`,
    `${ind(2)}${tag('&lt;/p&gt;')}`,
    `${ind(1)}${tag('&lt;/footer&gt;')}`,
    `${b1(')')}${op(';')}`,
  ];
}

export function renderProfileComponent() {
  return [
    `${cm('// ProfileImage.tsx — Circular Profile Image')}`,
    ``,
    `${kw('import')} ${type('React')} ${kw('from')} ${str("'react'")}${op(';')}`,
    `${kw('import')} ${type('Image')} ${kw('from')} ${str("'next/image'")}${op(';')}`,
    ``,
    `${kw('interface')} ${type('ProfileImageProps')} ${b1('{')}`,
    `${ind(1)}${prop('src')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('alt')}${op(':')} ${type('string')}${op(';')}`,
    `${ind(1)}${prop('size')}${op('?:')} ${type('number')}${op(';')}`,
    `${b1('}')}`,
    ``,
    `${kw('export')} ${kw('const')} ${fn('ProfileImage')}${op(':')} ${type('React.FC')}${op('&lt;')}${type('ProfileImageProps')}${op('&gt;')} ${op('=')} ${b1('(')}${b2('{')}`,
    `${ind(1)}${param('src')}${op(',')}`,
    `${ind(1)}${param('alt')}${op(',')}`,
    `${ind(1)}${param('size')} ${op('=')} ${num('180')}${op(',')}`,
    `${b2('}')}${b1(')')} ${op('=>')} ${b1('(')}`,
    `${ind(1)}${tag('&lt;div')} ${attr('className')}${op('=')}${str('"profile-image-wrapper"')}${tag('&gt;')}`,
    `${ind(2)}${tag('&lt;Image')}`,
    `${ind(3)}${attr('src')}${op('=')}${op('{')}${param('src')}${op('}')}`,
    `${ind(3)}${attr('alt')}${op('=')}${op('{')}${param('alt')}${op('}')}`,
    `${ind(3)}${attr('width')}${op('=')}${op('{')}${param('size')}${op('}')}`,
    `${ind(3)}${attr('height')}${op('=')}${op('{')}${param('size')}${op('}')}`,
    `${ind(3)}${attr('className')}${op('=')}${str('"rounded-lg"')}`,
    `${ind(2)}${tag('/&gt;')}`,
    `${ind(1)}${tag('&lt;/div&gt;')}`,
    `${b1(')')}${op(';')}`,
  ];
}

export function renderResumeJson() {
  return [
    `${b1('{')}`,
    `${ind(1)}${str('"name"')}${op(':')} ${str('"Corey Birnie"')}${op(',')}`,
    `${ind(1)}${str('"title"')}${op(':')} ${str('"Advanced Software Engineer"')}${op(',')}`,
    `${ind(1)}${str('"location"')}${op(':')} ${str('"London, UK"')}${op(',')}`,
    `${ind(1)}${str('"email"')}${op(':')} ${str('"coreybirnie@gmail.com"')}${op(',')}`,
    `${ind(1)}${str('"linkedin"')}${op(':')} ${str('"linkedin.com/in/coreybirnie"')}${op(',')}`,
    `${ind(1)}${str('"github"')}${op(':')} ${str('"github.com/EvanGit09"')}${op(',')}`,
    `${ind(1)}${str('"summary"')}${op(':')} ${str('"Advanced Software Engineer specializing in"')}${op(',')}`,
    `${ind(1)}${cm('// full-stack TypeScript/React development, AI-first product')}`,
    `${ind(1)}${cm('// architecture, and leading engineering teams.')}`,
    `${ind(1)}${str('"yearsOfExperience"')}${op(':')} ${num('5')}${op(',')}`,
    `${ind(1)}${str('"currentCompany"')}${op(':')} ${str('"Worldover"')}`,
    `${b1('}')}`,
  ];
}

export function renderSkillsJson() {
  return [
    `${b1('{')}`,
    `${ind(1)}${str('"languages"')}${op(':')} ${b2('[')}`,
    `${ind(2)}${str('"TypeScript/JavaScript"')}${op(',')} ${str('"Python"')}${op(',')} ${str('"Gremlin"')}${op(',')}`,
    `${ind(2)}${str('"SQL"')}${op(',')} ${str('"Java"')}${op(',')} ${str('"C++"')}${op(',')} ${str('"Motoko"')}${op(',')} ${str('"Haskell"')}`,
    `${ind(1)}${b2(']')}${op(',')}`,
    `${ind(1)}${str('"technologies"')}${op(':')} ${b2('[')}`,
    `${ind(2)}${str('"React"')}${op(',')} ${str('"Next.js"')}${op(',')} ${str('"tRPC"')}${op(',')} ${str('"Zod"')}${op(',')}`,
    `${ind(2)}${str('"Tailwind CSS"')}${op(',')} ${str('"React Query"')}${op(',')} ${str('"Git"')}${op(',')}`,
    `${ind(2)}${str('"Linux"')}${op(',')} ${str('"Machine Learning"')}${op(',')} ${str('"PyTorch"')}${op(',')}`,
    `${ind(2)}${str('"ThreeJS"')}${op(',')} ${str('"MCP"')}`,
    `${ind(1)}${b2(']')}${op(',')}`,
    `${ind(1)}${str('"aws"')}${op(':')} ${b2('[')}`,
    `${ind(2)}${str('"Neptune"')}${op(',')} ${str('"Amplify"')}${op(',')} ${str('"S3"')}${op(',')}`,
    `${ind(2)}${str('"EC2"')}${op(',')} ${str('"OpenSearch"')}${op(',')} ${str('"Lambda"')}`,
    `${ind(1)}${b2(']')}`,
    `${b1('}')}`,
  ];
}

export function renderReadme() {
  return [
    `${cm('# Corey Birnie — Portfolio')}`,
    ``,
    `${cm('> Advanced Software Engineer | London, UK')}`,
    ``,
    `${cm('## About')}`,
    ``,
    `${cm('This is my personal portfolio website built with Next.js,')}`,
    `${cm('TypeScript, and Tailwind CSS. It showcases my professional')}`,
    `${cm('experience, projects, and technical skills.')}`,
    ``,
    `${cm('## Getting Started')}`,
    ``,
    `${str(BT+BT+BT+'bash')}`,
    `${fn('npm')} ${str('install')}`,
    `${fn('npm')} ${str('run')} ${str('dev')}`,
    `${str(BT+BT+BT)}`,
    ``,
    `${cm('## Tech Stack')}`,
    ``,
    `${cm('- **Framework:** Next.js 15')}`,
    `${cm('- **Language:** TypeScript 5')}`,
    `${cm('- **Styling:** Tailwind CSS 4')}`,
    `${cm('- **Testing:** Vitest + Playwright')}`,
    `${cm('- **Deployment:** Vercel')}`,
    ``,
    `${cm('## Contact')}`,
    ``,
    `${cm('- Email: coreybirnie@gmail.com')}`,
    `${cm('- LinkedIn: linkedin.com/in/coreybirnie')}`,
    `${cm('- GitHub: github.com/EvanGit09')}`,
  ];
}

// ============================================================
// Master render dispatch
// ============================================================

const RENDERERS = {
  'about': renderAbout,
  'experience': renderExperience,
  'projects': renderProjects,
  'blogs': renderBlogs,
  'education': renderEducation,
  'layout': renderLayout,
  'header-component': renderHeaderComponent,
  'footer-component': renderFooterComponent,
  'profile-component': renderProfileComponent,
  'resume-json': renderResumeJson,
  'skills-json': renderSkillsJson,
  'package-json': renderPackageJson,
  'tsconfig-json': renderTsConfig,
  'next-config': renderNextConfig,
  'readme': renderReadme,
};

export function renderPage(pageId) {
  const renderer = RENDERERS[pageId];
  if (!renderer) return [`${cm('// File not found')}`];
  return renderer();
}

// Minimap color extraction — returns a dominant color per line
export function getMinimapColors(lines) {
  return lines.map(line => {
    if (line.includes('class="cm"')) return 'var(--comment)';
    if (line.includes('class="str"')) return 'var(--yellow)';
    if (line.includes('class="kw"')) return 'var(--pink)';
    if (line.includes('class="type"')) return 'var(--cyan)';
    if (line.includes('class="fn"')) return 'var(--green)';
    if (line.includes('class="num"')) return 'var(--purple)';
    if (line.includes('class="tag"')) return 'var(--pink)';
    if (line.trim() === '') return 'transparent';
    return 'var(--fg)';
  });
}
