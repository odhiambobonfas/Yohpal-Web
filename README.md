## Getting Started

1. **Clone repo**
```console
git clone <url>
git switch -c <your_branch>
```

2. **Install dependencies**
```console
npm/<your_beloved_pkg_manager> install
```

3. **Run development server**
```console
npm/<your_beloved_pkg_manager> run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. **Run linter**
```console
npm/<your_beloved_pkg_manager> run lint
```


## Project Overview

```
.
├── actions/
├── app
│   ├── api/
│   ├── auth/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── (organization)/
│   └── (yohpal)/
├── components/
│   ├── custom/
│   │   ├── app/
│   │   └── orgarnization/
│   └── ui/
├── components.json
├── constants/
├── eslint.config.mjs
├── hooks/
├── lib/
├── next.config.ts
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── providers/
├── public/
├── README.md
├── services/
│   ├── client/
│   └── server/
├── tsconfig.json
├── actions/
└── types/
```

## Directory Overview
`actions/` - Server Actions that bridge services to client components

`app/` - Next.js App Router pages and layouts
- (organization) and (yohpal) are route groups for visual organization [^{grouped-routes}]

- `(organization)` contains all organization-related pages
- `(yohpal)` contains the main application pages
- `globals.css` provides shared styling across both sections

`components/` - Reusable UI components
- `custom/` - Custom-built components specific to this project
  - `app/` - components specific to `app/` functionality
  - `organization/` - components used inside organization-related routes

- `ui/` - Components sourced and extended from [shadcn/ui](https://ui.shadcn.com)

`constants/` - Centralized constants (app-wide values, enums, and config-like constants)

`hooks/` - Custom React hooks (client-side state and reusable logic)

`lib/` - General-purpose utilities and shared logic (API clients, formatters, helpers, etc.)

`providers/` - React context providers and application-level state management (auth, theme, etc.)

`public/` - Static assets (images, icons, files accessible directly via `/`)

`services/` - Business logic layer
- `client/` - interacts with Firebase **client SDK** (used in the browser)
- `server/` - interacts with Firebase **admin SDK** (server-only logic, SSR or API routes)

`types/` - TypeScript type definitions for the entire project

`actions/` - Server only actions are located, e.g handling setting/unsetting cookies from the client


## Conventions

### Naming
- Variables, functions, and parameters: `camelCase`
- Components, classes, types, and interfaces: `PascalCase`
- Constants: `UPPER_CASE`
- Unused variables/params: prefix with `__` (e.g. `__unusedVar`)

### Hooks
- Group hooks by domain inside subfolders (e.g. `hooks/user/`).
- **No side effects in `use...` hooks** — they are guaranteed readonly (data fetching, selectors, derived state).
- **Mutations must be explicit**: hooks that modify state/data must be named with the `Mutation` suffix (e.g. `useUserMutations`).

### Services
- Business logic **must not leak into components**.
- Use `services/client` for browser SDK logic, `services/server` for admin/server-side logic.
- Bascially any database operation should be done here

### Providers
- Keep global context/state management in `providers/`.
- Providers should avoid heavy business logic — delegate that to `services/`.

### Actions
- Server Actions are the **bridge layer** between client components and server services.
- Must be marked with `"use server"` at the top of the file.
- Used for:
  - Data mutations (create, update, delete operations)
  - Server-side cookie management (set, unset, read)
  - Form submissions and validations
  - Any operation requiring server-only secrets or admin privileges

*Why:*

- **Security**: Actions run on the server, so they can safely use admin SDKs and environment secrets.
- **Type safety**: Actions are fully type-safe when called from client components.
- Group actions by domain (e.g. `actions/user/`, `actions/auth/`).

## Learn More
> [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
>
> [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

[^{grouped-routes}]: [Grouped Routes](https://nextjs.org/docs/app/getting-started/project-structure#route-groups-and-private-folders)

