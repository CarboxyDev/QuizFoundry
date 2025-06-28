# UI Notes & Design Decisions

## Onboarding Flow

- Use a 2-step onboarding flow after signup:
  - Step 1: Ask for name and user role (teacher, student, etc.)
  - Step 2: Ask about intent/use case

- UI Style:
  - Use a carded multi-step layout
  - Center-aligned with a progress indicator
  - Use radio/select-style inputs with subtle hover animations

- Store:
  - `name`, `role` in `profiles` table
  - `onboarding_step` as integer to track progress

## General

- Use `toast` notifications for all async feedback
- Use skeletons during AI quiz generation
- Use tabs or accordion for quiz editing later
