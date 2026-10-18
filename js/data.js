// ============================================================
// data.js — All portfolio content & file tree structure
// ============================================================

export const FILE_TREE = {
  name: "COREY-BIRNIE-PORTFOLIO",
  type: "root",
  open: true,
  children: [
    {
      name: "src",
      type: "folder",
      open: true,
      children: [
        {
          name: "app",
          type: "folder",
          open: true,
          children: [
            {
              name: "layout.tsx",
              type: "file",
              fileType: "tsx",
              page: "layout",
            },
          ],
        },
        {
          name: "pages",
          type: "folder",
          open: true,
          children: [
            { name: "about.tsx", type: "file", fileType: "tsx", page: "about" },
            {
              name: "work-experience.ts",
              type: "file",
              fileType: "ts",
              page: "experience",
            },
            {
              name: "projects.ts",
              type: "file",
              fileType: "ts",
              page: "projects",
            },
            { name: "blogs.ts", type: "file", fileType: "ts", page: "blogs" },
            {
              name: "education.ts",
              type: "file",
              fileType: "ts",
              page: "education",
            },
          ],
        },
        {
          name: "components",
          type: "folder",
          open: false,
          children: [
            {
              name: "Header.tsx",
              type: "file",
              fileType: "tsx",
              page: "header-component",
            },
            {
              name: "Footer.tsx",
              type: "file",
              fileType: "tsx",
              page: "footer-component",
            },
            {
              name: "ProfileImage.tsx",
              type: "file",
              fileType: "tsx",
              page: "profile-component",
            },
          ],
        },
        {
          name: "data",
          type: "folder",
          open: false,
          children: [
            {
              name: "resume.json",
              type: "file",
              fileType: "json",
              page: "resume-json",
            },
            {
              name: "skills.json",
              type: "file",
              fileType: "json",
              page: "skills-json",
            },
          ],
        },
      ],
    },
    {
      name: "public",
      type: "folder",
      open: false,
      children: [
        { name: "profile.jpg", type: "file", fileType: "image", page: null },
      ],
    },
    {
      name: "cv.pdf",
      type: "file",
      fileType: "pdf",
      page: "cv",
      visibleWhen: "SHOW_CV",
    },
    {
      name: "package.json",
      type: "file",
      fileType: "json",
      page: "package-json",
    },
    {
      name: "tsconfig.json",
      type: "file",
      fileType: "json",
      page: "tsconfig-json",
    },
    {
      name: "next.config.ts",
      type: "file",
      fileType: "ts",
      page: "next-config",
    },
    { name: "README.md", type: "file", fileType: "md", page: "readme" },
  ],
};

// Path lookup for breadcrumbs
export const FILE_PATHS = {
  about: "src / pages / about.tsx",
  experience: "src / pages / work-experience.ts",
  projects: "src / pages / projects.ts",
  blogs: "src / pages / blogs.ts",
  education: "src / pages / education.ts",
  layout: "src / app / layout.tsx",
  "header-component": "src / components / Header.tsx",
  "footer-component": "src / components / Footer.tsx",
  "profile-component": "src / components / ProfileImage.tsx",
  "resume-json": "src / data / resume.json",
  "skills-json": "src / data / skills.json",
  cv: "cv.pdf",
  "package-json": "package.json",
  "tsconfig-json": "tsconfig.json",
  "next-config": "next.config.ts",
  readme: "README.md",
};

// Language for status bar
export const FILE_LANGUAGES = {
  tsx: "TypeScript React",
  ts: "TypeScript",
  json: "JSON",
  md: "Markdown",
  image: "Image",
  pdf: "PDF Document",
};
