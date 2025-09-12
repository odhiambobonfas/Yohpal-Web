> This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First, run the development server:

```bash
npm/<your_beloved_pkg_manager> install
npm/<your_beloved_pkg_manager> run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Overview

```
.
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── (organization)/
│   └── (yohpal)/
├── components/
│   ├── custom/
│   ├── ThemeProvider.tsx
│   └── ui/
├── components.json
├── eslint.config.mjs
├── hooks/
├── lib/
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│   ├── org/
│   └── app/
├── README.md
├── tsconfig.json
└── types/
```

## Directory Overview
`app/` - Next.js App Router pages and layouts
- (organization) and (yohpal) are route groups for visual organization
> [Grouped Routes](https://nextjs.org/docs/app/getting-started/project-structure#route-groups-and-private-folders)
- `(organization)` contains all organization-related pages
- `(yohpal)` contains the main application pages
- `globals.css` provides shared styling across both sections

`components/` - Reusable UI components
- `custom/` - Custom-built components specific to this project
- `ui/` - Components from shadcn/ui

`hooks/` - Custom React hooks
`lib/` - Utility functions and shared logic
`public/` - Static assets (accessible via /org/, /app/, etc.)
`types/` - TypeScript type definitions for the entire project

## Learn More
> [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
> [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
