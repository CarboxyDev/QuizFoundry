# Fullstack Monorepo

This is a modern fullstack monorepo powered by:

- 🧩 [pnpm Workspaces](https://pnpm.io/workspaces)
- ⚡️ Next.js 15 (Frontend)
- 🚀 Express.js + TypeScript (Backend)
- 🧰 Shared utility and type packages inside /packages

---

## 📁 Folder Structure

```bash
.
├── frontend/           # Next.js 15 app
├── backend/            # Express.js server
├── packages/
│   ├── utils/          # Shared utility functions
│   └── types/          # Shared TypeScript types
├── .prettierrc         # Prettier config
├── .eslintrc.cjs       # ESLint config
├── tsconfig.json       # TS project references
├── package.json        # Root workspace manager
└── pnpm-workspace.yaml # Workspace config
```

---

## Run dev servers

```bash
cd frontend && pnpm run dev   # for frontend
cd backend && pnpm run dev    # for backend
supabase start # for full db + services
supabase start --exclude edge-runtime,realtime,storage-api # for core db
```

## Development URLs

Frontend: http://localhost:4000
Backend: http://localhost:8080
Database: http://127.0.0.1:54321
Database Studio: http://localhost:54323

## Cloud URLs (Hosted)

Frontend: ?
Backend: ?
Database: https://ejyfqvdatautcibfvagc.supabase.co
Database Studio: https://supabase.com/dashboard/project/ejyfqvdatautcibfvagc/database/schemas
