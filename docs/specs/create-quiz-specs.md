# 🧠 Create Quiz Page – Functional Spec

This document defines the behavior and flow for the **Create Quiz** page in the AI Quiz Maker app.

---

## 📝 Quiz Prompt

- A large textarea for the user to input a quiz prompt.
- Below the input, show dynamic text:
  - _"This will generate {questionCount} questions with {optionCount} options each."_
  - Values update based on mode and inputs.

---

## ⚙️ Modes

### 🚀 Express Mode

- Toggle switch to enable.
- When ON:
  - Skips all additional settings.
  - Uses default values:
    - Question Count: 5
    - Options per Question: 4
    - Difficulty: Medium
  - On submission:
    - Generates the quiz immediately.
    - Redirects to the quiz view.
    - Quiz is saved and marked `is_manual = false`.

---

### 🔧 Advanced Mode

- Toggle switch to enable (mutually exclusive with Express Mode).
- When ON:
  - Show input fields:
    - Question Count (3–20, default 5)
    - Options per Question (2–8, default 4)
    - Difficulty (Easy / Medium / Hard)
  - Also shows:
    - **Manual Mode** checkbox

---

## ✍️ Manual Mode (Advanced Only)

- If OFF:
  - Quiz is generated immediately with custom settings.
  - Redirect to quiz view.
  - Saved to DB (`is_manual = false`).
- If ON:
  - Generates a prototype quiz from settings.
  - Redirects to an Edit Quiz page.
  - Quiz is **not saved yet**.
  - After editing and submitting, the quiz is saved (`is_manual = true`).

---

## ✅ Behavior Notes

- Form is only submittable when prompt is non-empty and inputs are valid.
- Express Mode and Advanced Mode are mutually exclusive.
- Manual Mode only appears in Advanced Mode.
- Edit Quiz page should support previewing and submitting the manually created quiz.

---
