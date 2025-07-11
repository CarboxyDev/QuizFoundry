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
5. Use clear, unambiguous language
6. Ensure all content relates to: "${input.prompt}"
7. Number order_index starting from 0
8. Generate exactly ${input.questionCount} questions with ${input.optionsCount} options each
9. Do not include any other text in the response.
10. Make sure you do not include "quiz" or "quiz on" or "Create a quiz on" in the title. The quiz title must consist of the key topic keywords only.

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
      return "   - Use straightforward questions with obvious correct answers\n   - Include basic concepts and definitions\n   - Avoid tricky or ambiguous phrasing";
    case "medium":
      return "   - Include some analytical thinking and application of concepts\n   - Mix of factual and reasoning questions\n   - Moderate complexity in language and concepts";
    case "hard":
      return "   - Require deep understanding and critical thinking\n   - Include complex scenarios and edge cases\n   - Challenge advanced knowledge of the topic";
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
