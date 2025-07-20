import { GoogleGenAI } from "@google/genai";
import { AppError } from "../errors/AppError";
import {
  PromptFormatter,
  CreativePromptGenerator,
  type QuizGenerationContext,
  type QuizContext as PromptQuizContext,
} from "./prompts";

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

function createQuizPrompt(input: QuizGenerationInput): Array<{ role: string; parts: Array<{ text: string }> }> {
  const context: QuizGenerationContext = {
    prompt: input.prompt,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    optionsCount: input.optionsCount,
  };

  const formattedPrompt = PromptFormatter.formatQuizGeneration(context);
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

export async function generateCreativeQuizPrompt(): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is not configured", 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Generate a new varied prompt each time for maximum diversity
  const dynamicPrompt = CreativePromptGenerator.generateVariedPrompt();

  console.log(`[Creative Quiz] Generating with variety seed: ${dynamicPrompt.substring(0, 100)}...`);

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: dynamicPrompt }],
      },
    ],
  });

  const generatedPrompt = response.text?.trim();
  if (!generatedPrompt) {
    throw new AppError("Failed to generate quiz prompt", 500);
  }
  
  console.log(`[Creative Quiz] Generated topic: "${generatedPrompt}"`);
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

    console.log(
      `[AI Question Generation] Generating ${count} questions for: "${context.title}"`
    );

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(
      `[AI Question Generation] Received response (${text.length} chars)`
    );

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate questions: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeAdditionalQuestionsResponse(
      parsedResult,
      context,
      count
    );

    console.log(
      `[AI Question Generation] Successfully generated ${normalizedResult.questions.length} questions`
    );

    return normalizedResult;
  } catch (error) {
    console.error(`[AI Question Generation] Error:`, error);

    if (
      error instanceof ContentRefusalError ||
      error instanceof InvalidResponseError
    ) {
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

    console.log(
      `[AI Question Enhancement] Enhancing question for: "${context.title}"`
    );

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(
      `[AI Question Enhancement] Received response (${text.length} chars)`
    );

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

    if (
      error instanceof ContentRefusalError ||
      error instanceof InvalidResponseError
    ) {
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
    const prompt = createAdditionalOptionsPrompt(
      questionText,
      existingOptions,
      optionsCount
    );

    console.log(
      `[AI Options Generation] Generating ${optionsCount} options for question`
    );

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(
      `[AI Options Generation] Received response (${text.length} chars)`
    );

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate options: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult = normalizeAdditionalOptionsResponse(
      parsedResult,
      optionsCount
    );

    console.log(
      `[AI Options Generation] Successfully generated ${normalizedResult.options.length} options`
    );

    return normalizedResult;
  } catch (error) {
    console.error(`[AI Options Generation] Error:`, error);

    if (
      error instanceof ContentRefusalError ||
      error instanceof InvalidResponseError
    ) {
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

    console.log(
      `[AI Question Type Suggestions] Generating suggestions for topic: "${topic}"`
    );

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AIGenerationError("No response received from Gemini API", true);
    }

    console.log(
      `[AI Question Type Suggestions] Received response (${text.length} chars)`
    );

    if (isContentRefusal(text)) {
      const reasoning = extractRefusalReasoning(text);
      throw new ContentRefusalError(
        `AI refused to generate question type suggestions: ${reasoning}`,
        reasoning
      );
    }

    const parsedResult = parseAIResponse(text);
    const normalizedResult =
      normalizeQuestionTypeSuggestionsResponse(parsedResult);

    console.log(
      `[AI Question Type Suggestions] Successfully generated ${normalizedResult.suggestions.length} suggestions`
    );

    return normalizedResult;
  } catch (error) {
    console.error(`[AI Question Type Suggestions] Error:`, error);

    if (
      error instanceof ContentRefusalError ||
      error instanceof InvalidResponseError
    ) {
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

function createAdditionalQuestionsPrompt(
  context: QuizContext,
  count: number
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const promptContext: PromptQuizContext = {
    title: context.title,
    description: context.description,
    difficulty: context.difficulty,
    originalPrompt: context.originalPrompt,
    existingQuestions: context.existingQuestions,
  };

  const formattedPrompt = PromptFormatter.formatAdditionalQuestions(promptContext, count);
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

function createQuestionEnhancementPrompt(
  questionText: string,
  context: QuizContext
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const promptContext: PromptQuizContext = {
    title: context.title,
    description: context.description,
    difficulty: context.difficulty,
    originalPrompt: context.originalPrompt,
    existingQuestions: context.existingQuestions,
  };

  const formattedPrompt = PromptFormatter.formatQuestionEnhancement(questionText, promptContext);
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

function createAdditionalOptionsPrompt(
  questionText: string,
  existingOptions: Array<{ option_text: string; is_correct: boolean }>,
  optionsCount: number
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const formattedPrompt = PromptFormatter.formatAdditionalOptions(
    questionText,
    existingOptions,
    optionsCount
  );
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

function createQuestionTypeSuggestionsPrompt(
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const formattedPrompt = PromptFormatter.formatQuestionTypeSuggestions(topic, difficulty);
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

function normalizeAdditionalQuestionsResponse(
  parsedResult: any,
  _context: QuizContext,
  expectedCount: number
): GeneratedQuestionsResult {
  if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
    throw new InvalidResponseError("Questions array is missing or invalid");
  }

  if (parsedResult.questions.length === 0) {
    throw new InvalidResponseError("No questions were generated");
  }

  const questions: GeneratedQuestion[] = parsedResult.questions.map(
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
    }
  );

  if (questions.length !== expectedCount) {
    console.warn(
      `[AI Question Generation] Generated ${questions.length} questions, expected ${expectedCount}`
    );
  }

  return { questions };
}

function normalizeQuestionEnhancementResponse(
  parsedResult: any
): EnhancedQuestionResult {
  if (
    !parsedResult.enhanced_question ||
    typeof parsedResult.enhanced_question !== "object"
  ) {
    throw new InvalidResponseError(
      "Enhanced question object is missing or invalid"
    );
  }

  const enhanced = parsedResult.enhanced_question;

  if (!enhanced.question_text || typeof enhanced.question_text !== "string") {
    throw new InvalidResponseError(
      "Enhanced question text is missing or invalid"
    );
  }

  if (!enhanced.reasoning || typeof enhanced.reasoning !== "string") {
    throw new InvalidResponseError(
      "Enhancement reasoning is missing or invalid"
    );
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

  const options: GeneratedOption[] = parsedResult.options.map(
    (opt: any, optIndex: number) => {
      if (!opt.option_text || typeof opt.option_text !== "string") {
        throw new InvalidResponseError(
          `Option ${optIndex + 1}: Missing or invalid option text`
        );
      }

      if (opt.is_correct === true) {
        console.warn(
          `[AI Options Generation] Option ${optIndex + 1} was marked as correct, forcing to false`
        );
      }

      return {
        option_text: opt.option_text.trim(),
        is_correct: false,
        order_index: optIndex,
      };
    }
  );

  if (options.length !== expectedCount) {
    console.warn(
      `[AI Options Generation] Generated ${options.length} options, expected ${expectedCount}`
    );
  }

  return { options };
}

function normalizeQuestionTypeSuggestionsResponse(
  parsedResult: any
): QuestionTypeSuggestionsResult {
  if (!parsedResult.suggestions || !Array.isArray(parsedResult.suggestions)) {
    throw new InvalidResponseError("Suggestions array is missing or invalid");
  }

  if (parsedResult.suggestions.length === 0) {
    throw new InvalidResponseError("No suggestions were generated");
  }

  const suggestions: QuestionTypeSuggestion[] = parsedResult.suggestions.map(
    (sugg: any, index: number) => {
      if (!sugg.type || typeof sugg.type !== "string") {
        throw new InvalidResponseError(
          `Suggestion ${index + 1}: Missing or invalid type`
        );
      }

      if (!sugg.description || typeof sugg.description !== "string") {
        throw new InvalidResponseError(
          `Suggestion ${index + 1}: Missing or invalid description`
        );
      }

      if (!sugg.example || typeof sugg.example !== "string") {
        throw new InvalidResponseError(
          `Suggestion ${index + 1}: Missing or invalid example`
        );
      }

      return {
        type: sugg.type.trim(),
        description: sugg.description.trim(),
        example: sugg.example.trim(),
      };
    }
  );

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
): Array<{ role: string; parts: Array<{ text: string }> }> {
  const formattedPrompt = PromptFormatter.formatSecurityCheck(quizContent);
  
  return [
    {
      role: "user",
      parts: [{ text: formattedPrompt }],
    },
  ];
}

function parseSecurityCheckResponse(text: string): AISecurityCheckResult {
  try {
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
