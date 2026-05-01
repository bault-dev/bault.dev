# Project Context & Agent Instructions

## 1. Project Overview
**Name**: bault.dev
**Description**: A modern full-stack web application built with Next.js 16 (App Router), utilizing React 19, Tailwind CSS v4, and Shadcn UI for a premium, responsive frontend. The backend relies on Next.js server actions/API routes, with Postgres as the database managed by Drizzle ORM. Authentication is handled by `better-auth`.
**Core Concept:** A "Google Drive for Developers". It allows users to store, organize, and share code-related files (snippets, .env configs, components). Users belong to **Organizations** ("Projects" in UI).
**Tiers:** Free (1 Project/Org limit) and Pro (unlimited).

## 2. Tech Stack & Infrastructure
### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4, `shadcn/ui` components
- **Icons**: `lucide-react`
- **Animations**: `motion` (Framer Motion), `tw-animate-css`
- **State Management**: Zustand
- **Forms**: `react-hook-form`, `zod`, `@hookform/resolvers`

### Backend & Database
- **Runtime**: Node.js (via Next.js)
- **Database**: Postgres (hosted on Supabase)
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Driver**: `postgres`
- **Authentication**: `better-auth` with **Organization Plugin**
- **Storage**: Cloudflare R2 (S3 Compatible)

### Tooling
- **Package Manager**: pnpm
- **Linter/Formatter**: Biome (`@biomejs/biome`)
- **TypeScript**: v5

## 3. Architecture Patterns

### Authentication & Authorization
- **Better Auth** is the single source of truth.
- **Client Side:** Use hooks from `@/lib/auth-client.ts` (`useSession`, `useListOrganizations`, `useActiveOrganization`).
- **Server Side:** Use `auth.api.getSession({ headers })` in Server Actions.
- **RBAC:** Roles (`owner`, `admin`, `member`) managed via Better Auth Organization plugin.

### Database (Drizzle)
- Schemas located in `/db/schemas`.
- **Key Mappings:**
  - UI **"Project"** → DB **`organization`** table (Better Auth).
  - UI **"Member"** → DB **`member`** table (Better Auth).
  - UI **"File"** → DB **`files`** table.
- **Relationships:**
  - `files` link to `organizationId`, NOT directly to `userId` (except direct shares).
  - `files` link to `folderId` (nullable, null = root).

### File Upload Strategy (R2)
- **Direct-to-Client Uploads ONLY**. Never proxy large files through Next.js server.
- **Flow:**
  1. Client requests Presigned URL via Server Action (`getUploadUrl`).
  2. Server validates permissions.
  3. Server generates R2 Signed URL.
  4. Client performs `PUT` directly to R2.
  5. Client calls `saveFileToDatabase` Server Action to persist metadata.
- **Storage Path:** `projects/{organizationId}/{fileUuid}.{extension}`

## 4. Key Data Structures (Mental Model)
- **`files` Table**: `id` (UUID), `organizationId` (FK), `folderId` (FK, nullable), `storageKey` (R2 path), `size` (BigInt), `isEncrypted` (Bool).
- **`folders` Table**: `id` (UUID), `organizationId` (FK), `parentId` (FK, nullable).
- **`file_shares` Table**: For sharing files outside the organization.

## 5. Coding Conventions
- **Server Actions**: Place in `@/actions`. Top with `"use server"`. **Always** validate auth session.
- **Components**: Place in `@/components`. `components/ui` for primitives.
- **Forms**: `react-hook-form` + `zod`.
- **Styling**: Tailwind utility classes. Consistent design tokens.
- **Safety**: Do not delete data without approval.

## 6. AI Agent Instructions

### ⚡️ CRITICAL: Context7 MCP Usage
**Always use Context7 MCP for library/API documentation, code generation, and setup.**
- `context7.resolve-library-id`: Find library IDs.
- `context7.query-docs`: Fetch docs (Next.js, Better Auth, Drizzle, Shadcn).
- **Do not guess** API signatures.

### 🧠 Project Skills & Rules
Check these skills before starting related tasks:
1.  **Web Design & UI/UX**: `/.agents/skills/web-design-guidelines/SKILL.md` (Triggers: "review UI", "audit design").
2.  **Authentication**: `/.agents/skills/better-auth-best-practices/SKILL.md` (Triggers: "auth flow", "login", "security").
3.  **Performance**: `/.agents/skills/vercel-react-best-practices/SKILL.md` (Triggers: "optimize", "refactor").

### General Guidelines
- **Code Style**: Functional components, hooks, strict types.
- **Refactoring**: Update imports when moving files.
- **Next.js 16**: Use `proxy` instead of `middleware` for route protection. Node.js runtime for proxy.
