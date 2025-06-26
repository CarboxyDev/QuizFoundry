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
