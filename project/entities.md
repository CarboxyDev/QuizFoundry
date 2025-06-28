# Entities

## User

- id (UUID)
- name, email
- onboarding_step

## Quiz

- id
- owner_id (foreign key to User)
- title
- created_at

## Question

- id
- quiz_id (foreign key)
- text
- options[]
- correct_answer
- ai_generated (bool)
