# Database Architecture & Migration Workflow

> **Audience:** Engineers familiar with TypeScript/Prisma but new to raw SQL & Supabase migrations.
>
> **Goal:** Understand how data is modelled, how migrations are authored/applied, and how the backend talks to the database.

---

## 1. Tech Stack At-a-Glance

| Layer            | Tool                                    | Purpose                                         |
| ---------------- | --------------------------------------- | ----------------------------------------------- |
| Database         | **PostgreSQL 16** (managed by Supabase) | Relational data store & auth provider           |
| Migration engine | **Supabase CLI** (`supabase db ...`)    | Generates & executes SQL migration scripts      |
| App server       | **Express + @supabase/supabase-js**     | Executes database queries inside route services |

Supabase wraps vanilla Postgres. We work directly with SQL (**not** an ORM like Prisma) because:

1. Full access to Postgres features (RLS, functions, triggers).
2. No runtime translation layer → fewer surprises & better perf.
3. The Supabase dashboard still provides a friendly GUI when you need it.

---

## 2. Directory Tour

```text
supabase/
  └─ migrations/            # 👉 ordered *.sql files (auto-generated)
backend/
  └─ lib/supabase.ts        # 👉 creates 3 Supabase clients (auth, service, admin)
```

### `supabase/migrations/*.sql`

Each file is timestamp-prefixed so Postgres can apply them **deterministically**:

```text
20250629154945_init_core_tables.sql
20250630000000_add_quiz_tables.sql
20250706153734_add_is_manual_to_quizzes.sql
20250706175301_quiz-attempts.sql
```

Naming pattern: `YYYYMMDDHHMMSS_description.sql` (automatically produced by the Supabase CLI).

> Think of these files like Prisma’s `migrations/` but written in raw SQL.

### `backend/lib/supabase.ts`

Creates three typed Supabase clients used throughout the server layer:

- **`supabaseAuth`** – validates JWTs coming from the frontend (anon key).
- **`supabase`** – default service-role client (honours RLS policies).
- **`supabaseAdmin`** – bypasses RLS for admin or cron tasks.

All route services import one of these, e.g. `import supabase from "@/lib/supabase"`.

---

## 3. How a Migration Is Born 🐣

1. **Generate**

   ```bash
   supabase migration new add_my_feature
   ```

   Creates `supabase/migrations/<timestamp>_add_my_feature.sql` with an empty template.

2. **Edit SQL** – add `CREATE TABLE`, `ALTER TABLE`, policies, indices…

3. **Apply locally**

   ```bash
   supabase db reset      # fresh local Postgres w/ all migrations
   # OR
   supabase db push       # apply only the new migration
   ```

4. **Commit & push** – CI/CD (or manual) will run `supabase db push` on the staging/prod project which executes the _same_ ordered files.

Migrations are **idempotent** – each runs exactly once per database.

---

## 4. What Lives Inside the Current Migrations?

| Migration                          | Key Objects                                | Notes                                                                          |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| **`init_core_tables.sql`**         | `profiles`, `onboarding_progress`          | Basic user profile + onboarding state. RLS so users can only touch their row.  |
| **`add_quiz_tables.sql`**          | `quizzes`, `questions`, `question_options` | Main quiz engine tables + indexes + RLS + trigger to auto-update `updated_at`. |
| **`add_is_manual_to_quizzes.sql`** | Column `is_manual` on `quizzes`            | Small schema tweak.                                                            |
| **`quiz-attempts.sql`**            | `quiz_attempts`, `quiz_attempt_answers`    | Records each user attempt & per-question answers.                              |

### Example: `quizzes` table (excerpt)

```sql
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  is_public boolean default true,
  is_ai_generated boolean default true,
  is_manual boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Row-Level Security (RLS)

Every table is `ENABLE ROW LEVEL SECURITY`. Policies then gate **SELECT / INSERT / UPDATE / DELETE**. Example policy for `quizzes`:

```sql
create policy "Users can view their own quizzes"
  on quizzes for select using (auth.uid() = user_id);
```

RLS means even the service-role client honours these checks unless you explicitly use the admin client.

### Triggers & Functions

- `update_updated_at_column()` – generic PL/pgSQL trigger keeps `updated_at` fresh on every row update.

---

## 5. Lifecycle of a Request (End to End)

1. **HTTP → Express** (`backend/index.ts` mounts routers like `/api/quizzes`).
2. **Router → Controller** (`routes/quizzes.ts` → `controllers/quizController.ts`).
3. **Controller → Service** (`services/quizService.ts`) – calls Supabase:
   ```ts
   const { data, error } = await supabase
     .from("quizzes")
     .select("*")
     .eq("id", quizId)
     .single();
   ```
4. **Supabase->Postgres** – SQL executes, RLS checked, rows returned.
5. **JSON Response** sent to frontend.

Because the service role key is used, the **database enforces security**. The server layer adds business logic but **never worries about multi-tenant data leaks**.

---

## 6. Adding / Changing Schema Safely

1. Generate a new migration (see §3).
2. Write SQL – remember to:
   - `ENABLE ROW LEVEL SECURITY`.
   - Add `create policy` statements.
   - Add indices for common filters / joins.
3. Run `supabase db reset` locally – verify queries still work via tests or Supabase Studio.
4. Commit & push; migrations travel with the code.

> Tip: Treat migrations as _immutable_. Never edit a committed file – create a new `ALTER` migration instead (similar to Prisma).

---

## 7. Local Development Cheatsheet

```bash
pnpm dev          # runs backend & frontend
supabase start    # boots local Postgres + Studio
supabase db reset # rebuild local DB from migrations
```

---

## 8. Handy References

- Supabase Migrations Docs: <https://supabase.com/docs/guides/database#migrations>
- Row Level Security Guides: <https://supabase.com/docs/learn/auth-deep-dive/authrow-level-security>
- `@supabase/supabase-js` Client API: <https://supabase.com/docs/reference/js>

Happy scheming! 🎉
