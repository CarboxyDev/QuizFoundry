# Development Tasks

This is a granular breakdown of the MVP features. Each task should represent a single atomic unit of work.

---

## ✅ Auth & Onboarding

- [-] Install and configure Supabase client
- [-] Build sign-up page with email/password and also google sign in
- [-] Build login page with email/password
- [-] Create auth context + hook (`useAuth`)
- [-] Redirect to onboarding if user has not completed it
- [-] Create onboarding Step 1 – collect name
- [-] Create onboarding Step 2 – collect role/preference
- [-] Store onboarding progress in `profiles` table
- [-] Auto-complete onboarding if coming from Google
- [-] Update onboarding related info on backend to reflect its mandatory nature

---

## ✅ AI Quiz Generation

- [-] Create prompt input form (difficulty, option count, etc.)
- [-] Validate prompt input and sanitize
- [-] Call Gemini API for the quiz
- [-] Show loading spinner or skeleton while generating
- [-] Parse AI response into usable `Quiz` format
- [ ] Display AI-generated questions in preview
- [ ] Add "Regenerate" and "Edit" buttons per quiz
- [ ] Allow user to tweak individual questions before saving

---

## ✅ Manual Quiz Creation & Editing

- [ ] Build empty quiz editor UI
- [ ] Add ability to add a question manually
- [ ] Add ability to add multiple choice options
- [ ] Add support for short-answer question type
- [ ] Mark one option as the correct answer
- [ ] Auto-save question or show Save button
- [ ] Track which questions were AI-generated (boolean)

---

## ✅ Quiz Management (Private)

- [-] Create a Supabase `quizzes` table and `questions` table
- [-] Save quiz metadata (title, tags, user_id, is_public)
- [-] Save full quiz with associated questions
- [-] Build dashboard UI to list all user quizzes
- [ ] Allow editing/deleting of a quiz
- [ ] Add sorting by title and creation date

---

## ✅ Public Quiz Sharing & Browsing

- [ ] Add `is_public` flag to quizzes
- [ ] Add toggle to make quiz public/private
- [ ] Build public quiz list page (for unauth users)
- [ ] Build public quiz view (readonly)
- [ ] Add public URL copy/share button

---

## ✅ User Dashboard & Settings

- [ ] Build dashboard layout (cards or table)
- [ ] Show quiz count and recent activity
- [ ] Add navigation to edit profile/settings
- [ ] Add editable name field
- [ ] Add "Delete account" button (optional)

---

## ✅ UI/UX Enhancements

- [ ] Show toast notifications for success/errors
- [ ] Add skeleton loaders for AI generation and dashboard
- [ ] Add empty states (e.g. no quizzes created)
- [ ] Make quiz creation/editing UI mobile responsive
- [ ] Fix layout bugs in onboarding and auth flows
