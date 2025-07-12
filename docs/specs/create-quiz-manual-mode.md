# Create Quiz - Manual Mode Flow

- Unlike the Express mode or Advanced Mode (without Manual), where the quiz is created and stored instantly from the single request sent from the frontend to the backend - the Manual Mode does create the quiz but it doesn't store it in the database
- This quiz is called a prototype quiz since it will be manually modified with or without the help of AI.
- Prototype quizzes when converted into a full quiz at the end of the flow will be marked as not ai_generated.

- Below I have given the very important user flow that you need to give importance to in order to create proper code.

User Flow:

- User checks the checkbox for manual mode
- Clicks button for generating prototype quiz
- Special request is sent to the backend.
- The quiz is created BUT NOT STORED based on the defaults or the selected values from the frontend. This request does still use AI.
- At this point, the quiz is still not actually in a "published" state.
- Backend responds with appropriate prototype quiz data.
- The user is redirected to a page like /create-quiz/manual where the prototype quiz data is prefilled.
- The user is able to edit many things about this prototype quiz like the questions and options contents, add more questions. They are also able to change the ordering of the questions. They are also able to change the difficulty, title and description of the quiz at the top. They still have the option to change the visibility of the quiz and toggle between public and private.
- This whole live editing feature should be feature-rich, intuitive and easy.
- At the end, the user can confirm that they want to publish/create the quiz.
- If they are fine with it, they can click yes.
- A request will be sent to the backend in a dedicated route with all the contents.
- The backend will perform security checks using AI and may reject this publication/creation of the quiz based on the AI response. The backend however must give some form of reasoning behind why the quiz was rejected.
- If the manual quiz passes all the checks, it will finally be created and stored in the database and will be accessible on the website.
- If the manual quiz is public, it will also be visible in the public quizzes page and it will be marked as Human Made.
