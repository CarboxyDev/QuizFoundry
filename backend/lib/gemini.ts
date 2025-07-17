import { GoogleGenAI } from "@google/genai";
import { AppError } from "../errors/AppError";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const model = "gemini-2.5-flash-lite-preview-06-17";

export interface GeneratedQuiz {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  question_text: string;
  question_type: "multiple_choice";
  order_index: number;
  options: GeneratedOption[];
}

export interface GeneratedOption {
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizGenerationInput {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  optionsCount: number;
}

export class AIGenerationError extends AppError {
  constructor(
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message, 500);
    this.name = "AIGenerationError";
  }
}

export class ContentRefusalError extends AppError {
  constructor(
    message: string,
    public readonly reasoning: string
  ) {
    super(message, 400);
    this.name = "ContentRefusalError";
  }
}

export class InvalidResponseError extends AppError {
  constructor(
    message: string,
    public readonly rawResponse?: string
  ) {
    super(message, 500);
    this.name = "InvalidResponseError";
  }
}

export async function generateQuizWithAI(
  input: QuizGenerationInput,
  retryCount: number = 0
): Promise<GeneratedQuiz> {
  const MAX_RETRIES = 2;

  if (!process.env.GEMINI_API_KEY) {
    throw new AIGenerationError("Gemini API key is not configured", false);
  }

  validateInput(input);

  try {
    const prompt = createQuizPrompt(input);

    console.log(`[AI Generation] Attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
    console.log(
      `[AI Generation] Sending prompt for: ${input.difficulty} quiz with ${input.questionCount} questions`
    );

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(`[AI Generation] Received response (${text.length} chars)`);

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate quiz: ${reasoning}`,
        reasoning
      );
    }

    const parsedQuiz = parseAIResponse(text);
    const normalizedQuiz = normalizeAIResponse(parsedQuiz, input);

    console.log(
      `[AI Generation] Successfully generated quiz: "${normalizedQuiz.title}"`
    );

    return normalizedQuiz;
  } catch (error) {
    console.error(`[AI Generation] Error on attempt ${retryCount + 1}:`, error);

    if (error instanceof ContentRefusalError) {
      throw error;
    }

    if (error instanceof InvalidResponseError) {
      throw error;
    }

    // ! Only Retry on network/temporary errors
    if (
      error instanceof AIGenerationError &&
      error.retryable &&
      retryCount < MAX_RETRIES
    ) {
      console.log(
        `[AI Generation] Retrying in 1 second... (attempt ${retryCount + 2})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateQuizWithAI(input, retryCount + 1);
    }

    if (!(error instanceof AppError)) {
      console.error(`[AI Generation] Unexpected error:`, error);
      throw new AIGenerationError(
        "An unexpected error occurred while generating the quiz. Please try again.",
        true
      );
    }

    throw error;
  }
}

function validateInput(input: QuizGenerationInput): void {
  if (!input.prompt?.trim()) {
    throw new AppError("Quiz prompt cannot be empty", 400);
  }

  if (input.prompt.length < 10) {
    throw new AppError("Quiz prompt must be at least 10 characters", 400);
  }

  if (input.prompt.length > 2000) {
    throw new AppError("Quiz prompt must be less than 2000 characters", 400);
  }

  if (input.questionCount < 3 || input.questionCount > 20) {
    throw new AppError("Question count must be between 3 and 20", 400);
  }

  if (input.optionsCount < 2 || input.optionsCount > 8) {
    throw new AppError("Options count must be between 2 and 8", 400);
  }

  if (!["easy", "medium", "hard"].includes(input.difficulty)) {
    throw new AppError("Difficulty must be easy, medium, or hard", 400);
  }
}

function parseAIResponse(text: string): any {
  try {
    // Extract JSON from the response
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/) ||
      text.match(/\{[\s\S]*\}/);

    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    if (!jsonText?.trim()) {
      throw new InvalidResponseError(
        "No JSON content found in AI response",
        text.substring(0, 500)
      );
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== "object") {
      throw new InvalidResponseError(
        "AI response is not a valid object",
        text.substring(0, 500)
      );
    }

    return parsed;
  } catch (parseError) {
    if (parseError instanceof InvalidResponseError) {
      throw parseError;
    }

    console.error("[AI Generation] JSON parse error:", parseError);
    throw new InvalidResponseError(
      "Failed to parse AI response as JSON. Please try again.",
      text.substring(0, 500)
    );
  }
}

function isContentRefusal(text: string): boolean {
  if (!text) return false;

  const refusalPatterns = [
    /I cannot|I can't|I'm unable to|I won't be able to/i,
    /I cannot fulfill|I cannot create|I cannot generate|I cannot provide/i,
    /inappropriate|harmful|offensive|unethical/i,
    /against my guidelines|violates guidelines|against my programming/i,
    /refuse to generate|cannot assist with/i,
  ];

  return refusalPatterns.some((pattern) => pattern.test(text));
}

function extractRefusalReasoning(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  const reasoningKeywords = [
    "because",
    "since",
    "as",
    "due to",
    "reason",
    "harmful",
    "offensive",
    "inappropriate",
    "unethical",
    "violates",
    "against",
    "promotes",
  ];

  for (const sentence of sentences) {
    if (
      reasoningKeywords.some((keyword) =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      return sentence.trim();
    }
  }

  const substantialSentence = sentences.find((s) => s.trim().length > 30);
  if (substantialSentence) {
    return substantialSentence.trim();
  }

  return "Content was deemed inappropriate by the AI";
}

function normalizeAIResponse(
  parsedQuiz: any,
  input: QuizGenerationInput
): GeneratedQuiz {
  /**
   * ! Validate quiz structure
   */
  if (!parsedQuiz.title || typeof parsedQuiz.title !== "string") {
    throw new InvalidResponseError("Quiz title is missing or invalid");
  }

  if (!Array.isArray(parsedQuiz.questions)) {
    throw new InvalidResponseError("Quiz questions are missing or invalid");
  }

  if (parsedQuiz.questions.length === 0) {
    throw new InvalidResponseError("Quiz must have at least one question");
  }

  let title = parsedQuiz.title.trim();
  const titleWords = title.split(/\s+/);
  if (titleWords.length > 8) {
    title = titleWords.slice(0, 8).join(" ");
  }

  const questions: GeneratedQuestion[] = parsedQuiz.questions.map(
    (q: any, qIndex: number) => {
      if (!q.question_text || typeof q.question_text !== "string") {
        throw new InvalidResponseError(
          `Question ${qIndex + 1}: Missing or invalid question text`
        );
      }

      if (!Array.isArray(q.options)) {
        throw new InvalidResponseError(
          `Question ${qIndex + 1}: Missing or invalid options`
        );
      }

      if (q.options.length === 0) {
        throw new InvalidResponseError(
          `Question ${qIndex + 1}: Must have at least one option`
        );
      }

      // Normalize options
      const options: GeneratedOption[] = q.options.map(
        (opt: any, optIndex: number) => {
          if (!opt.option_text || typeof opt.option_text !== "string") {
            throw new InvalidResponseError(
              `Question ${qIndex + 1}, Option ${optIndex + 1}: Missing or invalid option text`
            );
          }

          return {
            option_text: opt.option_text.trim(),
            is_correct: Boolean(opt.is_correct),
            order_index: optIndex,
          };
        }
      );

      // Validate that the response has exactly one correct answer
      const correctCount = options.filter((opt) => opt.is_correct).length;
      if (correctCount !== 1) {
        throw new InvalidResponseError(
          `Question ${qIndex + 1}: Must have exactly one correct answer (found ${correctCount})`
        );
      }

      if (options.length !== input.optionsCount) {
        console.warn(
          `[AI Generation] Question ${qIndex + 1}: Generated ${options.length} options, expected ${input.optionsCount}`
        );
      }

      return {
        question_text: q.question_text.trim(),
        question_type: "multiple_choice" as const,
        order_index: qIndex,
        options,
      };
    }
  );

  if (questions.length !== input.questionCount) {
    console.warn(
      `[AI Generation] Generated ${questions.length} questions, expected ${input.questionCount}`
    );
  }

  return {
    title,
    description:
      parsedQuiz.description?.trim() ||
      `A ${input.difficulty} difficulty quiz covering various aspects of the topic.`,
    difficulty: input.difficulty,
    questions,
  };
}

function createQuizPrompt(input: QuizGenerationInput): string {
  const suggestedTitle = generateTitleFromPrompt(input.prompt);

  return `You are an expert quiz creator. Create a ${input.difficulty} difficulty quiz with the following specifications:

REQUIREMENTS:
- Topic: ${input.prompt}
- Difficulty Level: ${input.difficulty}
- Number of Questions: ${input.questionCount}
- Options per Question: ${input.optionsCount}
- Question Type: Multiple choice only

RESPONSE FORMAT:
Respond with ONLY a valid JSON object in this exact format:

{
  "title": "A concise, engaging title (max 8 words)",
  "description": "Brief description of what this quiz covers (1-2 sentences)",
  "difficulty": "${input.difficulty}",
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
        // Continue for exactly ${input.optionsCount} options
      ]
    }
    // Continue for exactly ${input.questionCount} questions
  ]
}

QUALITY GUIDELINES:
1. Title should be engaging and concise (suggested: "${suggestedTitle}")
2. For ${input.difficulty} difficulty:
   ${getDifficultyGuidelines(input.difficulty)}
3. Each question must have EXACTLY ONE correct answer
4. Incorrect options should be plausible but clearly wrong
5. The correct answer must be accurate and correct. Incorrect answers will result in a terrible experience for the user.
6. Use clear, unambiguous language
7. Ensure all content relates to: "${input.prompt}"
8. Number order_index starting from 0
9. Generate exactly ${input.questionCount} questions with ${input.optionsCount} options each
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

Generate the quiz now:`;
}

function generateTitleFromPrompt(prompt: string): string {
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

function getDifficultyGuidelines(difficulty: string): string {
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

export async function generateCreativeQuizPrompt(): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is not configured", 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `Generate a creative and engaging quiz topic title.
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
  "The surprising science behind everyday phenomena"
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const generatedPrompt = response.text?.trim();
  if (!generatedPrompt) {
    throw new AppError("Failed to generate quiz prompt", 500);
  }
  return generatedPrompt;
}

// =============================================
// AI ASSISTANCE FEATURES FOR ADVANCED QUIZ EDITING
// =============================================

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

export interface GeneratedQuestionsResult {
  questions: GeneratedQuestion[];
}

export interface EnhancedQuestionResult {
  enhanced_question: {
    question_text: string;
    reasoning: string;
  };
}

export interface GeneratedOptionsResult {
  options: GeneratedOption[];
}

export interface QuestionTypeSuggestion {
  type: string;
  description: string;
  example: string;
}

export interface QuestionTypeSuggestionsResult {
  suggestions: QuestionTypeSuggestion[];
}

export async function generateAdditionalQuestions(
  context: QuizContext,
  count: number
): Promise<GeneratedQuestionsResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIGenerationError("Gemini API key is not configured", false);
  }

  if (count < 1 || count > 5) {
    throw new AppError("Question count must be between 1 and 5", 400);
  }

  try {
    const prompt = createAdditionalQuestionsPrompt(context, count);
    
    console.log(`[AI Question Generation] Generating ${count} questions for: "${context.title}"`);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(`[AI Question Generation] Received response (${text.length} chars)`);

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate questions: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeAdditionalQuestionsResponse(parsedResult, context, count);

    console.log(`[AI Question Generation] Successfully generated ${normalizedResult.questions.length} questions`);
    
    return normalizedResult;
  } catch (error) {
    console.error(`[AI Question Generation] Error:`, error);
    
    if (error instanceof ContentRefusalError || error instanceof InvalidResponseError) {
      throw error;
    }
    
    if (!(error instanceof AppError)) {
      throw new AIGenerationError(
        "An unexpected error occurred while generating questions. Please try again.",
        true
      );
    }
    
    throw error;
  }
}

export async function enhanceQuestion(
  questionText: string,
  context: QuizContext
): Promise<EnhancedQuestionResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIGenerationError("Gemini API key is not configured", false);
  }

  if (!questionText.trim()) {
    throw new AppError("Question text cannot be empty", 400);
  }

  if (questionText.length > 500) {
    throw new AppError("Question text must be less than 500 characters", 400);
  }

  try {
    const prompt = createQuestionEnhancementPrompt(questionText, context);
    
    console.log(`[AI Question Enhancement] Enhancing question for: "${context.title}"`);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(`[AI Question Enhancement] Received response (${text.length} chars)`);

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to enhance question: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeQuestionEnhancementResponse(parsedResult);

    console.log(`[AI Question Enhancement] Successfully enhanced question`);
    
    return normalizedResult;
  } catch (error) {
    console.error(`[AI Question Enhancement] Error:`, error);
    
    if (error instanceof ContentRefusalError || error instanceof InvalidResponseError) {
      throw error;
    }
    
    if (!(error instanceof AppError)) {
      throw new AIGenerationError(
        "An unexpected error occurred while enhancing the question. Please try again.",
        true
      );
    }
    
    throw error;
  }
}

export async function generateAdditionalOptions(
  questionText: string,
  existingOptions: Array<{ option_text: string; is_correct: boolean }>,
  optionsCount: number
): Promise<GeneratedOptionsResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIGenerationError("Gemini API key is not configured", false);
  }

  if (!questionText.trim()) {
    throw new AppError("Question text cannot be empty", 400);
  }

  if (optionsCount < 1 || optionsCount > 4) {
    throw new AppError("Options count must be between 1 and 4", 400);
  }

  if (existingOptions.length === 0) {
    throw new AppError("At least one existing option is required", 400);
  }

  try {
    const prompt = createAdditionalOptionsPrompt(questionText, existingOptions, optionsCount);
    
    console.log(`[AI Options Generation] Generating ${optionsCount} options for question`);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(`[AI Options Generation] Received response (${text.length} chars)`);

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate options: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeAdditionalOptionsResponse(parsedResult, optionsCount);

    console.log(`[AI Options Generation] Successfully generated ${normalizedResult.options.length} options`);
    
    return normalizedResult;
  } catch (error) {
    console.error(`[AI Options Generation] Error:`, error);
    
    if (error instanceof ContentRefusalError || error instanceof InvalidResponseError) {
      throw error;
    }
    
    if (!(error instanceof AppError)) {
      throw new AIGenerationError(
        "An unexpected error occurred while generating options. Please try again.",
        true
      );
    }
    
    throw error;
  }
}

export async function suggestQuestionTypes(
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<QuestionTypeSuggestionsResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIGenerationError("Gemini API key is not configured", false);
  }

  if (!topic.trim()) {
    throw new AppError("Topic cannot be empty", 400);
  }

  if (topic.length > 200) {
    throw new AppError("Topic must be less than 200 characters", 400);
  }

  try {
    const prompt = createQuestionTypeSuggestionsPrompt(topic, difficulty);
    
    console.log(`[AI Question Type Suggestions] Generating suggestions for topic: "${topic}"`);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(`[AI Question Type Suggestions] Received response (${text.length} chars)`);

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate question type suggestions: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeQuestionTypeSuggestionsResponse(parsedResult);

    console.log(`[AI Question Type Suggestions] Successfully generated ${normalizedResult.suggestions.length} suggestions`);
    
    return normalizedResult;
  } catch (error) {
    console.error(`[AI Question Type Suggestions] Error:`, error);
    
    if (error instanceof ContentRefusalError || error instanceof InvalidResponseError) {
      throw error;
    }
    
    if (!(error instanceof AppError)) {
      throw new AIGenerationError(
        "An unexpected error occurred while generating question type suggestions. Please try again.",
        true
      );
    }
    
    throw error;
  }
}

function createAdditionalQuestionsPrompt(context: QuizContext, count: number): string {
  const existingQuestionsText = context.existingQuestions?.length ? 
    context.existingQuestions.map((q, i) => `${i + 1}. ${q.question_text}`).join('\n') : 
    "None";

  return `You are an expert quiz creator. Generate ${count} additional questions for an existing quiz.

QUIZ CONTEXT:
- Title: ${context.title}
- Description: ${context.description || "No description provided"}
- Difficulty: ${context.difficulty}
- Original Prompt: ${context.originalPrompt}

EXISTING QUESTIONS:
${existingQuestionsText}

REQUIREMENTS:
- Generate exactly ${count} new questions
- Match the ${context.difficulty} difficulty level
- Questions should complement existing questions (avoid duplicates)
- Each question must have exactly 4 options
- Each question must have exactly one correct answer
- Questions should be relevant to the topic: "${context.originalPrompt}"

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
1. For ${context.difficulty} difficulty:
   ${getDifficultyGuidelines(context.difficulty)}
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

Generate the questions now:`;
}

function createQuestionEnhancementPrompt(questionText: string, context: QuizContext): string {
  return `You are an expert quiz creator. Enhance the following question to make it clearer, more engaging, and better suited for the quiz difficulty level.

ORIGINAL QUESTION:
${questionText}

QUIZ CONTEXT:
- Title: ${context.title}
- Difficulty: ${context.difficulty}
- Topic: ${context.originalPrompt}

ENHANCEMENT GOALS:
1. Improve clarity and readability
2. Match the ${context.difficulty} difficulty level
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
1. For ${context.difficulty} difficulty:
   ${getDifficultyGuidelines(context.difficulty)}
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

Enhance the question now:`;
}

function createAdditionalOptionsPrompt(
  questionText: string,
  existingOptions: Array<{ option_text: string; is_correct: boolean }>,
  optionsCount: number
): string {
  const existingOptionsText = existingOptions.map((opt, i) => 
    `${i + 1}. ${opt.option_text} ${opt.is_correct ? '(CORRECT)' : '(INCORRECT)'}`
  ).join('\n');

  return `You are an expert quiz creator. Generate ${optionsCount} additional INCORRECT answer options for this question.

QUESTION:
${questionText}

EXISTING OPTIONS:
${existingOptionsText}

REQUIREMENTS:
- Generate exactly ${optionsCount} new INCORRECT options
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

Generate the options now:`;
}

function createQuestionTypeSuggestionsPrompt(topic: string, difficulty: "easy" | "medium" | "hard"): string {
  return `You are an expert quiz creator. Suggest 5 different question types that would work well for a ${difficulty} quiz about "${topic}".

TOPIC: ${topic}
DIFFICULTY: ${difficulty}

REQUIREMENTS:
- Suggest 5 different question types/approaches
- Each suggestion should be specific to the topic
- Include a brief description of what the question type focuses on
- Provide a sample question text for each type
- Types should be appropriate for ${difficulty} difficulty

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
1. For ${difficulty} difficulty:
   ${getDifficultyGuidelines(difficulty)}
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

Generate the suggestions now:`;
}

function normalizeAdditionalQuestionsResponse(
  parsedResult: any,
  context: QuizContext,
  expectedCount: number
): GeneratedQuestionsResult {
  if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
    throw new InvalidResponseError("Questions array is missing or invalid");
  }

  if (parsedResult.questions.length === 0) {
    throw new InvalidResponseError("No questions were generated");
  }

  const questions: GeneratedQuestion[] = parsedResult.questions.map((q: any, qIndex: number) => {
    if (!q.question_text || typeof q.question_text !== "string") {
      throw new InvalidResponseError(`Question ${qIndex + 1}: Missing or invalid question text`);
    }

    if (!Array.isArray(q.options)) {
      throw new InvalidResponseError(`Question ${qIndex + 1}: Missing or invalid options`);
    }

    if (q.options.length === 0) {
      throw new InvalidResponseError(`Question ${qIndex + 1}: Must have at least one option`);
    }

    const options: GeneratedOption[] = q.options.map((opt: any, optIndex: number) => {
      if (!opt.option_text || typeof opt.option_text !== "string") {
        throw new InvalidResponseError(
          `Question ${qIndex + 1}, Option ${optIndex + 1}: Missing or invalid option text`
        );
      }

      return {
        option_text: opt.option_text.trim(),
        is_correct: Boolean(opt.is_correct),
        order_index: optIndex,
      };
    });

    const correctCount = options.filter((opt) => opt.is_correct).length;
    if (correctCount !== 1) {
      throw new InvalidResponseError(
        `Question ${qIndex + 1}: Must have exactly one correct answer (found ${correctCount})`
      );
    }

    return {
      question_text: q.question_text.trim(),
      question_type: "multiple_choice" as const,
      order_index: qIndex,
      options,
    };
  });

  if (questions.length !== expectedCount) {
    console.warn(
      `[AI Question Generation] Generated ${questions.length} questions, expected ${expectedCount}`
    );
  }

  return { questions };
}

function normalizeQuestionEnhancementResponse(parsedResult: any): EnhancedQuestionResult {
  if (!parsedResult.enhanced_question || typeof parsedResult.enhanced_question !== "object") {
    throw new InvalidResponseError("Enhanced question object is missing or invalid");
  }

  const enhanced = parsedResult.enhanced_question;

  if (!enhanced.question_text || typeof enhanced.question_text !== "string") {
    throw new InvalidResponseError("Enhanced question text is missing or invalid");
  }

  if (!enhanced.reasoning || typeof enhanced.reasoning !== "string") {
    throw new InvalidResponseError("Enhancement reasoning is missing or invalid");
  }

  return {
    enhanced_question: {
      question_text: enhanced.question_text.trim(),
      reasoning: enhanced.reasoning.trim(),
    },
  };
}

function normalizeAdditionalOptionsResponse(
  parsedResult: any,
  expectedCount: number
): GeneratedOptionsResult {
  if (!parsedResult.options || !Array.isArray(parsedResult.options)) {
    throw new InvalidResponseError("Options array is missing or invalid");
  }

  if (parsedResult.options.length === 0) {
    throw new InvalidResponseError("No options were generated");
  }

  const options: GeneratedOption[] = parsedResult.options.map((opt: any, optIndex: number) => {
    if (!opt.option_text || typeof opt.option_text !== "string") {
      throw new InvalidResponseError(
        `Option ${optIndex + 1}: Missing or invalid option text`
      );
    }

    // Ensure all generated options are incorrect
    if (opt.is_correct === true) {
      console.warn(`[AI Options Generation] Option ${optIndex + 1} was marked as correct, forcing to false`);
    }

    return {
      option_text: opt.option_text.trim(),
      is_correct: false, // Force all generated options to be incorrect
      order_index: optIndex,
    };
  });

  if (options.length !== expectedCount) {
    console.warn(
      `[AI Options Generation] Generated ${options.length} options, expected ${expectedCount}`
    );
  }

  return { options };
}

function normalizeQuestionTypeSuggestionsResponse(parsedResult: any): QuestionTypeSuggestionsResult {
  if (!parsedResult.suggestions || !Array.isArray(parsedResult.suggestions)) {
    throw new InvalidResponseError("Suggestions array is missing or invalid");
  }

  if (parsedResult.suggestions.length === 0) {
    throw new InvalidResponseError("No suggestions were generated");
  }

  const suggestions: QuestionTypeSuggestion[] = parsedResult.suggestions.map((sugg: any, index: number) => {
    if (!sugg.type || typeof sugg.type !== "string") {
      throw new InvalidResponseError(`Suggestion ${index + 1}: Missing or invalid type`);
    }

    if (!sugg.description || typeof sugg.description !== "string") {
      throw new InvalidResponseError(`Suggestion ${index + 1}: Missing or invalid description`);
    }

    if (!sugg.example || typeof sugg.example !== "string") {
      throw new InvalidResponseError(`Suggestion ${index + 1}: Missing or invalid example`);
    }

    return {
      type: sugg.type.trim(),
      description: sugg.description.trim(),
      example: sugg.example.trim(),
    };
  });

  return { suggestions };
}

// =============================================
// AI SECURITY CHECK FOR MANUAL QUIZZES
// =============================================

export interface AISecurityCheckResult {
  isApproved: boolean;
  reasoning: string;
  confidence: number;
  concerns: string[];
}

export interface QuizContentForValidation {
  title: string;
  description?: string;
  questions: {
    question_text: string;
    options: {
      option_text: string;
      is_correct: boolean;
    }[];
  }[];
}

export async function validateQuizContent(
  quizContent: QuizContentForValidation
): Promise<AISecurityCheckResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is not configured", 500);
  }

  try {
    console.log(`[AI Security Check] Validating quiz: "${quizContent.title}"`);

    const prompt = createSecurityCheckPrompt(quizContent);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      throw new AppError("No response received from AI security check", 500);
    }

    console.log(`[AI Security Check] Received response (${text.length} chars)`);

    const result = parseSecurityCheckResponse(text);

    console.log(
      `[AI Security Check] Result: ${result.isApproved ? "APPROVED" : "REJECTED"} (confidence: ${result.confidence}%)`
    );

    return result;
  } catch (error) {
    console.error("[AI Security Check] Error during validation:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to validate quiz content. Please try again.",
      500
    );
  }
}

function createSecurityCheckPrompt(
  quizContent: QuizContentForValidation
): string {
  const questionsText = quizContent.questions
    .map(
      (q, index) =>
        `Question ${index + 1}: ${q.question_text}
${q.options.map((opt, optIndex) => `  ${optIndex + 1}. ${opt.option_text}`).join("\n")}`
    )
    .join("\n\n");

  return `You are an AI content moderator responsible for reviewing user-generated quiz content for quality and safety. 

QUIZ TO REVIEW:
Title: ${quizContent.title}
Description: ${quizContent.description || "No description provided"}

QUESTIONS:
${questionsText}

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

Evaluate the quiz now:`;
}

function parseSecurityCheckResponse(text: string): AISecurityCheckResult {
  try {
    // Extract JSON from the response
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/) ||
      text.match(/\{[\s\S]*\}/);

    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    if (!jsonText?.trim()) {
      throw new InvalidResponseError(
        "No JSON content found in AI security check response",
        text.substring(0, 500)
      );
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== "object") {
      throw new InvalidResponseError(
        "AI security check response is not a valid object",
        text.substring(0, 500)
      );
    }

    // Validate the response structure
    if (typeof parsed.isApproved !== "boolean") {
      throw new InvalidResponseError(
        "AI security check response missing or invalid isApproved field"
      );
    }

    if (typeof parsed.reasoning !== "string") {
      throw new InvalidResponseError(
        "AI security check response missing or invalid reasoning field"
      );
    }

    if (
      typeof parsed.confidence !== "number" ||
      parsed.confidence < 0 ||
      parsed.confidence > 100
    ) {
      throw new InvalidResponseError(
        "AI security check response missing or invalid confidence field"
      );
    }

    if (!Array.isArray(parsed.concerns)) {
      throw new InvalidResponseError(
        "AI security check response missing or invalid concerns field"
      );
    }

    return {
      isApproved: parsed.isApproved,
      reasoning: parsed.reasoning.trim(),
      confidence: Math.round(parsed.confidence),
      concerns: parsed.concerns.map((concern: any) => String(concern).trim()),
    };
  } catch (error) {
    if (error instanceof InvalidResponseError) {
      throw error;
    }

    console.error("[AI Security Check] Parse error:", error);
    throw new InvalidResponseError(
      "Failed to parse AI security check response",
      text.substring(0, 500)
    );
  }
}
