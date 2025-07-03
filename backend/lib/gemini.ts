import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../errors/AppError";
import type {
  CreateQuizInput,
  QuizWithQuestionsInput,
} from "../schemas/quizSchemas";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

/**
 * Generate a quiz using Gemini AI
 */
export async function generateQuizWithAI(
  input: CreateQuizInput
): Promise<GeneratedQuiz> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("Gemini API key is not configured", 500);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createQuizPrompt(input);
    console.log("Sending prompt to Gemini AI:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Received response from Gemini AI:", text);

    // Parse the JSON response
    let parsedQuiz: any;
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch =
        text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      parsedQuiz = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new AppError("Failed to parse AI response. Please try again.", 500);
    }

    // Validate and normalize the response
    const normalizedQuiz = normalizeAIResponse(parsedQuiz, input);

    return normalizedQuiz;
  } catch (error) {
    console.error("Error generating quiz with AI:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to generate quiz. Please check your prompt and try again.",
      500
    );
  }
}

/**
 * Create a structured prompt for Gemini AI
 */
function createQuizPrompt(input: CreateQuizInput): string {
  const title = input.title || generateTitleFromPrompt(input.prompt);

  return `You are an expert quiz creator. Generate a ${input.difficulty} difficulty quiz based on the following requirements:

REQUIREMENTS:
- Topic: ${input.prompt}
- Difficulty: ${input.difficulty}
- Number of questions: ${input.questionCount}
- Options per question: ${input.optionsCount}
- Question type: Multiple choice only

RESPONSE FORMAT:
You must respond with a valid JSON object in this exact format:

\`\`\`json
{
  "title": "${title}",
  "description": "A brief description of what this quiz covers (1-2 sentences)",
  "difficulty": "${input.difficulty}",
  "questions": [
    {
      "question_text": "The actual question text here?",
      "question_type": "multiple_choice",
      "order_index": 0,
      "options": [
        {
          "option_text": "Option A text",
          "is_correct": false,
          "order_index": 0
        },
        {
          "option_text": "Option B text",
          "is_correct": true,
          "order_index": 1
        }
        // ... continue for ${input.optionsCount} total options
      ]
    }
    // ... continue for ${input.questionCount} total questions
  ]
}
\`\`\`

GUIDELINES:
1. Make questions challenging but fair for ${input.difficulty} level
2. Ensure only ONE option per question is marked as correct (is_correct: true)
3. Make incorrect options plausible but clearly wrong
4. Use clear, unambiguous language
5. Avoid trick questions unless appropriate for the difficulty
6. Number the order_index starting from 0
7. Ensure all questions are relevant to the topic: "${input.prompt}"

Generate the quiz now:`;
}

/**
 * Generate a title from the prompt if not provided
 */
function generateTitleFromPrompt(prompt: string): string {
  const words = prompt.split(" ").slice(0, 8); // Take first 8 words
  let title = words.join(" ");

  if (title.length > 50) {
    title = title.substring(0, 47) + "...";
  }

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Normalize and validate the AI response
 */
function normalizeAIResponse(
  parsedQuiz: any,
  input: CreateQuizInput
): GeneratedQuiz {
  if (!parsedQuiz || typeof parsedQuiz !== "object") {
    throw new AppError("Invalid quiz format received from AI", 500);
  }

  // Validate required fields
  if (!parsedQuiz.title || typeof parsedQuiz.title !== "string") {
    throw new AppError("Quiz title is missing or invalid", 500);
  }

  if (!Array.isArray(parsedQuiz.questions)) {
    throw new AppError("Quiz questions are missing or invalid", 500);
  }

  // Normalize questions
  const questions: GeneratedQuestion[] = parsedQuiz.questions.map(
    (q: any, index: number) => {
      if (!q.question_text || typeof q.question_text !== "string") {
        throw new AppError(
          `Question ${index + 1} text is missing or invalid`,
          500
        );
      }

      if (!Array.isArray(q.options)) {
        throw new AppError(
          `Question ${index + 1} options are missing or invalid`,
          500
        );
      }

      // Validate options
      const options: GeneratedOption[] = q.options.map(
        (opt: any, optIndex: number) => {
          if (!opt.option_text || typeof opt.option_text !== "string") {
            throw new AppError(
              `Question ${index + 1}, option ${optIndex + 1} text is missing`,
              500
            );
          }

          return {
            option_text: opt.option_text.trim(),
            is_correct: Boolean(opt.is_correct),
            order_index: optIndex,
          };
        }
      );

      // Ensure exactly one correct answer
      const correctCount = options.filter((opt) => opt.is_correct).length;
      if (correctCount !== 1) {
        throw new AppError(
          `Question ${index + 1} must have exactly one correct answer (found ${correctCount})`,
          500
        );
      }

      // Validate option count
      if (options.length !== input.optionsCount) {
        console.warn(
          `Question ${index + 1} has ${options.length} options, expected ${input.optionsCount}`
        );
      }

      return {
        question_text: q.question_text.trim(),
        question_type: "multiple_choice" as const,
        order_index: index,
        options,
      };
    }
  );

  // Validate question count
  if (questions.length !== input.questionCount) {
    console.warn(
      `Generated ${questions.length} questions, expected ${input.questionCount}`
    );
  }

  return {
    title: parsedQuiz.title.trim(),
    description: parsedQuiz.description?.trim() || "",
    difficulty: input.difficulty,
    questions,
  };
}
