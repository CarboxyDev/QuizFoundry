# Features Overview

This document outlines the major feature groups planned for the MVP.

---

## 1. Authentication & Onboarding

- Google sign-in via Supabase
- Email/password sign-up via Supabase
- Onboarding flow to collect basic user info (e.g. name, role)
- Onboarding progress persistence and redirection

---

## 2. AI-Powered Quiz Generation

- Prompt input for quiz generation (topic, difficulty, etc.)
- AI integration with OpenAI to generate quiz questions
- Option to regenerate or refine AI-generated quizzes
- Support for multiple question types (MCQ, short answer)

---

## 3. Manual Quiz Creation & Editing

- Manually add, edit, and delete questions
- Mark correct answer for MCQs
- Option to mix AI-generated and manual questions in one quiz
- Quiz metadata: title, tags, description

---

## 4. Quiz Management (Private)

- User dashboard showing created quizzes
- Ability to open, edit, delete quizzes
- Sorting/filtering quizzes by title/date
- Save quizzes with persistent IDs

---

## 5. Public Quiz Sharing & Browsing

- Toggle quizzes as public/private
- Public quiz listing page (read-only access)
- Public quiz view page (direct URL)
- (Post-MVP) Share with specific emails/groups

---

## 6. User Dashboard & Settings

- Dashboard overview
- Quick create buttons
- Profile view/edit (name, email)
- Delete account (if needed)

---

## 7. UI/UX Enhancements (MVP-level polish)

- Loading/skeleton states during AI calls
- Success/error toasts
- Responsive design for mobile/tablet
- Empty states for no quizzes / no results
