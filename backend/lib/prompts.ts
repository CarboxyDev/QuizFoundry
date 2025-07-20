export interface PromptTemplate {
  system?: string;
  user: string;
}

export interface QuizGenerationContext {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  optionsCount: number;
}

export interface QuizContext {
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  originalPrompt: string;
  existingQuestions?: Array<{
    question_text: string;
    options: Array<{
      option_text: string;
      is_correct: boolean;
    }>;
  }>;
}

export class PromptBuilder {
  static getDifficultyGuidelines(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "   - Use straightforward questions with obvious correct answers\n   - Include basic concepts and definitions\n   - Avoid tricky or ambiguous phrasing\n   - Questions should be answerable with fundamental knowledge\n   - Use simple, clear language that's easy to understand";
      case "medium":
        return "   - Include some analytical thinking and application of concepts\n   - Mix of factual and reasoning questions\n   - Moderate complexity in language and concepts\n   - Questions may require connecting multiple pieces of information\n   - Balance between recall and understanding";
      case "hard":
        return "   - Require deep understanding and critical thinking\n   - Include complex scenarios and edge cases\n   - Challenge advanced knowledge of the topic\n   - Questions may involve analysis, synthesis, or evaluation\n   - May require expert-level knowledge or specialized understanding";
      default:
        return "   - Adjust difficulty appropriately for the target audience";
    }
  }

  static generateTitleFromPrompt(prompt: string): string {
    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 6);

    let title = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (!title) {
      title = "Quiz";
    }

    return title + " Quiz";
  }
}

export const QUIZ_GENERATION_PROMPT: PromptTemplate = {
  system:
    "You are an expert quiz creator with deep knowledge across multiple domains. Your specialty is creating engaging, accurate, and well-structured educational quizzes that provide an excellent learning experience.",
  user: `Create a {difficulty} difficulty quiz with the following specifications:

REQUIREMENTS:
- Topic: {prompt}
- Difficulty Level: {difficulty}
- Number of Questions: {questionCount}
- Options per Question: {optionsCount}
- Question Type: Multiple choice only

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "title": "A concise, engaging title (max 8 words)",
  "description": "Brief description of what this quiz covers (1-2 sentences)",
  "difficulty": "{difficulty}",
  "questions": [
    {
      "question_text": "Clear, unambiguous question text?",
      "question_type": "multiple_choice",
      "order_index": 0,
      "options": [
        {
          "option_text": "First option text",
          "is_correct": false,
          "order_index": 0
        },
        {
          "option_text": "Second option text",
          "is_correct": true,
          "order_index": 1
        }
        // Continue for exactly {optionsCount} options
      ]
    }
    // Continue for exactly {questionCount} questions
  ]
}

QUALITY GUIDELINES:
1. Title should be engaging and concise (suggested: "{suggestedTitle}")
2. For {difficulty} difficulty:
{difficultyGuidelines}
3. Each question must have EXACTLY ONE correct answer
4. Incorrect options should be plausible but clearly wrong
5. The correct answer must be accurate and correct. Incorrect answers will result in a terrible experience for the user.
6. Use clear, unambiguous language
7. Ensure all content relates to: "{prompt}"
8. Number order_index starting from 0
9. Generate exactly {questionCount} questions with {optionsCount} options each
10. Do not include any other text in the response.
11. Make sure you do not include "quiz" or "quiz on" or "Create a quiz on" in the title. The quiz title must consist of the key topic keywords only.

QUESTION QUALITY REQUIREMENTS:
- Questions should be concise and focused (maximum 15-20 words)
- Avoid unnecessarily long or complex sentences
- Each question should test one specific concept or fact
- Questions should be direct and easy to understand
- Avoid ambiguous phrasing or double negatives
- Use active voice when possible
- Make questions engaging and interesting, not boring
- Ensure questions are neither too obvious nor impossibly difficult for the target difficulty level

OPTION QUALITY REQUIREMENTS:
- Keep options concise (maximum 8-10 words each)
- All options should be similar in length and structure
- Incorrect options should be believable distractors, not obviously wrong
- Avoid "all of the above" or "none of the above" options
- Each option should be a complete, standalone answer
- Options should be parallel in grammatical structure

Generate the quiz now:`,
};

export const CREATIVE_QUIZ_PROMPT: PromptTemplate = {
  system:
    "You are a creative educational content specialist who excels at generating engaging and diverse quiz topics that appeal to a wide audience.",
  user: `Generate a creative and engaging quiz topic title.
  The response should be a fun, educational, and interesting quiz idea that would make for great trivia.
  It should be small and concise and good enough to generate a good quiz.
  
  Choose topics from (but not limited to) areas like:
  - Pop culture and entertainment
  - Science and nature
  - Historical events and figures
  - Geography and world cultures
  - Food and cooking traditions
  - Technology and innovations
  - Art and literature
  - Sports and video games
  - Mythology and legends
  - Fun facts and general trivia
  - Other unique and engaging knowledge areas

  The response:
  - Must be only 1 sentence (at most 2), with no extra explanation
  - Should not include the word "quiz"
  - Should not include markdown, emojis, or formatting
  - Should avoid dramatic, poetic, or clickbait phrases (e.g., "unsung heroes", "unraveling the secrets", "the surprising science behind")
  - Should avoid vague or filler-heavy phrases
  - Must use simple, direct, and descriptive language

  Examples of excellent responses:
  "Food cultures from around the world",
  "Iconic video game soundtracks",
  "Popular mythological creatures from around the world",
  "Solar system planets and their characteristics",

  Examples of bad responses:
  "Unsung heroes of scientific breakthroughs",
  "Unraveling the secrets of the deep sea's most bizarre inhabitants."
  "The surprising science behind everyday phenomena"`,
};

export const ADDITIONAL_QUESTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an expert quiz creator specializing in maintaining consistency and flow within quiz sets while introducing fresh and engaging content.",
  user: `Generate {count} additional questions for an existing quiz.

QUIZ CONTEXT:
- Title: {title}
- Description: {description}
- Difficulty: {difficulty}
- Original Prompt: {originalPrompt}

EXISTING QUESTIONS:
{existingQuestions}

REQUIREMENTS:
- Generate exactly {count} new questions
- Match the {difficulty} difficulty level
- Questions should complement existing questions (avoid duplicates)
- Each question must have exactly 4 options
- Each question must have exactly one correct answer
- Questions should be relevant to the topic: "{originalPrompt}"

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "questions": [
    {
      "question_text": "Clear, unambiguous question text?",
      "question_type": "multiple_choice",
      "order_index": 0,
      "options": [
        {
          "option_text": "First option text",
          "is_correct": false,
          "order_index": 0
        },
        {
          "option_text": "Second option text",
          "is_correct": true,
          "order_index": 1
        },
        {
          "option_text": "Third option text",
          "is_correct": false,
          "order_index": 2
        },
        {
          "option_text": "Fourth option text",
          "is_correct": false,
          "order_index": 3
        }
      ]
    }
  ]
}

QUALITY GUIDELINES:
1. For {difficulty} difficulty:
{difficultyGuidelines}
2. Each question must have EXACTLY ONE correct answer
3. Incorrect options should be plausible but clearly wrong
4. The correct answer must be accurate and correct
5. Use clear, unambiguous language
6. Ensure all content relates to the topic
7. Number order_index starting from 0
8. Avoid duplicating existing questions
9. Do not include any other text in the response

QUESTION QUALITY REQUIREMENTS:
- Questions should be concise and focused (maximum 15-20 words)
- Avoid unnecessarily long or complex sentences
- Each question should test one specific concept or fact
- Questions should be direct and easy to understand
- Avoid ambiguous phrasing or double negatives
- Use active voice when possible
- Make questions engaging and interesting, not boring
- Ensure questions complement existing questions without being repetitive
- Questions should flow naturally within the quiz context

OPTION QUALITY REQUIREMENTS:
- Keep options concise (maximum 8-10 words each)
- All options should be similar in length and structure
- Incorrect options should be believable distractors, not obviously wrong
- Avoid "all of the above" or "none of the above" options
- Each option should be a complete, standalone answer
- Options should be parallel in grammatical structure
- Ensure options are relevant to the question and topic

Generate the questions now:`,
};

export const QUESTION_ENHANCEMENT_PROMPT: PromptTemplate = {
  system:
    "You are an expert educational content editor with a focus on clarity, engagement, and pedagogical effectiveness. Your specialty is improving quiz questions while maintaining their educational value.",
  user: `Enhance the following question to make it clearer, more engaging, and better suited for the quiz difficulty level.

ORIGINAL QUESTION:
{questionText}

QUIZ CONTEXT:
- Title: {title}
- Difficulty: {difficulty}
- Topic: {originalPrompt}

ENHANCEMENT GOALS:
1. Improve clarity and readability
2. Match the {difficulty} difficulty level
3. Make the question more engaging
4. Ensure it's appropriate for the topic
5. Fix any grammatical or structural issues

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "enhanced_question": {
    "question_text": "The improved question text here",
    "reasoning": "Brief explanation of what was improved and why"
  }
}

QUALITY GUIDELINES:
1. For {difficulty} difficulty:
{difficultyGuidelines}
2. Keep the core meaning of the original question
3. Make improvements that genuinely enhance the question
4. Ensure the enhanced question is still answerable
5. Use clear, unambiguous language
6. Keep reasoning concise (1-2 sentences)
7. Do not include any other text in the response

ENHANCEMENT FOCUS AREAS:
- Make the question more concise if it's too long (aim for 15-20 words maximum)
- Improve clarity and readability
- Remove ambiguous or confusing phrasing
- Ensure the question is direct and specific
- Fix grammatical issues or awkward wording
- Make the question more engaging while maintaining accuracy
- Ensure the question matches the appropriate difficulty level
- Remove double negatives or unnecessarily complex constructions
- Use active voice when possible
- Ensure the question is self-contained and doesn't rely on external context

Enhance the question now:`,
};

export const ADDITIONAL_OPTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an expert quiz creator with a specialty in crafting plausible distractors that test understanding while avoiding common pitfalls in multiple-choice design.",
  user: `Generate {optionsCount} additional INCORRECT answer options for this question.

QUESTION:
{questionText}

EXISTING OPTIONS:
{existingOptions}

REQUIREMENTS:
- Generate exactly {optionsCount} new INCORRECT options
- All new options must be wrong answers
- Options should be plausible but clearly incorrect
- Avoid duplicating existing options
- Options should be similar in length and style to existing options
- Each option should be a reasonable distractor

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "options": [
    {
      "option_text": "First new incorrect option",
      "is_correct": false,
      "order_index": 0
    },
    {
      "option_text": "Second new incorrect option",
      "is_correct": false,
      "order_index": 1
    }
  ]
}

QUALITY GUIDELINES:
1. All generated options must be INCORRECT answers
2. Options should be plausible distractors
3. Avoid obviously wrong or silly options
4. Match the style and length of existing options
5. Use clear, unambiguous language
6. Number order_index starting from 0
7. Do not include any other text in the response

OPTION QUALITY REQUIREMENTS:
- Keep options concise (maximum 8-10 words each)
- All options should be similar in length and structure to existing options
- Incorrect options should be believable distractors that test common misconceptions
- Avoid "all of the above" or "none of the above" options
- Each option should be a complete, standalone answer
- Options should be parallel in grammatical structure
- Ensure options are relevant to the question and topic
- Make sure options are not obviously wrong or absurd
- Use the same tone and style as the existing options
- Options should represent common wrong answers or misconceptions

Generate the options now:`,
};

export const QUESTION_TYPE_SUGGESTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an educational design expert with deep knowledge of assessment methodologies and question taxonomies. Your specialty is suggesting diverse question types that comprehensively evaluate understanding.",
  user: `Suggest 5 different question types that would work well for a {difficulty} quiz about "{topic}".

TOPIC: {topic}
DIFFICULTY: {difficulty}

REQUIREMENTS:
- Suggest 5 different question types/approaches
- Each suggestion should be specific to the topic
- Include a brief description of what the question type focuses on
- Provide a sample question text for each type
- Types should be appropriate for {difficulty} difficulty

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "suggestions": [
    {
      "type": "Definition Questions",
      "description": "Test understanding of key terms and concepts",
      "example": "What is the definition of [specific term]?"
    },
    {
      "type": "Application Questions",
      "description": "Test ability to apply knowledge in practical scenarios",
      "example": "In which situation would you use [specific concept]?"
    }
  ]
}

QUESTION TYPE CATEGORIES (choose from but not limited to):
- Definition/Terminology Questions
- Application/Scenario Questions
- Comparison/Contrast Questions
- Cause and Effect Questions
- Historical/Timeline Questions
- Process/Procedure Questions
- Identification Questions
- Analysis/Evaluation Questions
- Calculation/Problem-solving Questions
- True/False Concept Questions

QUALITY GUIDELINES:
1. For {difficulty} difficulty:
{difficultyGuidelines}
2. Each type should be distinct and valuable
3. Examples should be specific to the topic
4. Descriptions should be clear and helpful
5. Types should progressively build knowledge
6. Do not include any other text in the response

SUGGESTION QUALITY REQUIREMENTS:
- Make suggestions practical and actionable for quiz creators
- Ensure each suggestion type is clearly different from others
- Example questions should be concise (15-20 words maximum)
- Descriptions should be brief but informative (1-2 sentences)
- Focus on question types that work well for multiple choice format
- Suggestions should cover different aspects of the topic
- Examples should be engaging and appropriately challenging
- Each suggestion should add value to the quiz
- Avoid overly complex or academic question types
- Make sure suggestions are relevant to the specific topic provided

Generate the suggestions now:`,
};

export const SECURITY_CHECK_PROMPT: PromptTemplate = {
  system:
    "You are a content safety specialist with expertise in educational content moderation. Your role is to ensure quiz content meets high standards for safety, quality, and educational value while being fair and constructive in your evaluations.",
  user: `Review this user-generated quiz content for quality and safety. 

QUIZ TO REVIEW:
Title: {title}
Description: {description}

QUESTIONS:
{questions}

EVALUATION CRITERIA:
Please evaluate ALL parts of this quiz content (title, description, and questions) based on the following criteria:

1. SAFETY:
   - Title and description contain no harmful, offensive, or inappropriate content
   - Questions and options contain no harmful, offensive, or inappropriate content
   - No hate speech, discrimination, or harassment in any part
   - No dangerous or illegal activities referenced
   - No adult content or explicit material

2. QUALITY:
   - Title is appropriate and relevant to the quiz content
   - Description (if provided) accurately represents the quiz
   - Questions are clear and well-formed
   - Options are reasonable and relevant
   - Content is educational or entertaining
   - Factual accuracy where applicable

3. AUTHENTICITY:
   - Title and description appear to be genuine effort
   - Questions appear to be genuine effort
   - Not spam or low-effort content
   - Not misleading or deceptive

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "isApproved": true|false,
  "reasoning": "Clear explanation of the decision (1-2 sentences)",
  "confidence": 85,
  "concerns": ["List any specific concerns or issues found"]
}

GUIDELINES:
- Set isApproved to true if the content meets all criteria
- Set isApproved to false if there are significant violations
- confidence should be a number between 0-100
- concerns should be an array of specific issues (empty array if none)
- Keep reasoning concise but informative

Evaluate the quiz now:`,
};

export class PromptFormatter {
  static formatQuizGeneration(context: QuizGenerationContext): string {
    const suggestedTitle = PromptBuilder.generateTitleFromPrompt(
      context.prompt
    );
    const difficultyGuidelines = PromptBuilder.getDifficultyGuidelines(
      context.difficulty
    );

    return QUIZ_GENERATION_PROMPT.user
      .replace(/{difficulty}/g, context.difficulty)
      .replace(/{prompt}/g, context.prompt)
      .replace(/{questionCount}/g, context.questionCount.toString())
      .replace(/{optionsCount}/g, context.optionsCount.toString())
      .replace(/{suggestedTitle}/g, suggestedTitle)
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines);
  }

  static formatAdditionalQuestions(
    context: QuizContext,
    count: number
  ): string {
    const existingQuestionsText = context.existingQuestions?.length
      ? context.existingQuestions
          .map((q, i) => `${i + 1}. ${q.question_text}`)
          .join("\n")
      : "None";
    const difficultyGuidelines = PromptBuilder.getDifficultyGuidelines(
      context.difficulty
    );

    return ADDITIONAL_QUESTIONS_PROMPT.user
      .replace(/{count}/g, count.toString())
      .replace(/{title}/g, context.title)
      .replace(
        /{description}/g,
        context.description || "No description provided"
      )
      .replace(/{difficulty}/g, context.difficulty)
      .replace(/{originalPrompt}/g, context.originalPrompt)
      .replace(/{existingQuestions}/g, existingQuestionsText)
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines);
  }

  static formatQuestionEnhancement(
    questionText: string,
    context: QuizContext
  ): string {
    const difficultyGuidelines = PromptBuilder.getDifficultyGuidelines(
      context.difficulty
    );

    return QUESTION_ENHANCEMENT_PROMPT.user
      .replace(/{questionText}/g, questionText)
      .replace(/{title}/g, context.title)
      .replace(/{difficulty}/g, context.difficulty)
      .replace(/{originalPrompt}/g, context.originalPrompt)
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines);
  }

  static formatAdditionalOptions(
    questionText: string,
    existingOptions: Array<{ option_text: string; is_correct: boolean }>,
    optionsCount: number
  ): string {
    const existingOptionsText = existingOptions
      .map(
        (opt, i) =>
          `${i + 1}. ${opt.option_text} ${opt.is_correct ? "(CORRECT)" : "(INCORRECT)"}`
      )
      .join("\n");

    return ADDITIONAL_OPTIONS_PROMPT.user
      .replace(/{questionText}/g, questionText)
      .replace(/{existingOptions}/g, existingOptionsText)
      .replace(/{optionsCount}/g, optionsCount.toString());
  }

  static formatQuestionTypeSuggestions(
    topic: string,
    difficulty: "easy" | "medium" | "hard"
  ): string {
    const difficultyGuidelines =
      PromptBuilder.getDifficultyGuidelines(difficulty);

    return QUESTION_TYPE_SUGGESTIONS_PROMPT.user
      .replace(/{topic}/g, topic)
      .replace(/{difficulty}/g, difficulty)
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines);
  }

  static formatSecurityCheck(quizContent: {
    title: string;
    description?: string;
    questions: {
      question_text: string;
      options: {
        option_text: string;
        is_correct: boolean;
      }[];
    }[];
  }): string {
    const questionsText = quizContent.questions
      .map(
        (q, index) =>
          `Question ${index + 1}: ${q.question_text}
${q.options.map((opt, optIndex) => `  ${optIndex + 1}. ${opt.option_text}`).join("\n")}`
      )
      .join("\n\n");

    return SECURITY_CHECK_PROMPT.user
      .replace(/{title}/g, quizContent.title)
      .replace(
        /{description}/g,
        quizContent.description || "No description provided"
      )
      .replace(/{questions}/g, questionsText);
  }
}
