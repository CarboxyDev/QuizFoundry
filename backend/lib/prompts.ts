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

export const SHARED_QUALITY_REQUIREMENTS = {
  JSON_VALIDATION: `
CRITICAL JSON REQUIREMENTS:
- Your response MUST be valid, parseable JSON only
- Before responding, mentally validate your JSON structure
- Ensure all quotes are properly escaped
- Verify all brackets and braces are balanced
- Do not include any text before or after the JSON object
- If you cannot generate valid JSON, respond with an error object: {"error": "reason"}
`,

  QUESTION_QUALITY: `
QUESTION QUALITY STANDARDS:
- Questions should be concise and focused (maximum 15-20 words)
- Each question must test one specific concept or fact
- Use clear, direct language - avoid ambiguous phrasing
- Use active voice when possible
- Ensure exactly ONE correct answer per question
- Make questions appropriately challenging for the target difficulty
- Avoid double negatives or unnecessarily complex constructions
`,

  OPTION_QUALITY: `
OPTION QUALITY STANDARDS:
- Keep options concise (maximum 8-10 words each)
- All options should be similar in length and structure
- Incorrect options must be plausible distractors, not obviously wrong
- Avoid "all of the above" or "none of the above" options
- Each option should be a complete, standalone answer
- Options should be parallel in grammatical structure
- Ensure options test understanding, not just memorization
`,

  SELF_VALIDATION: `
SELF-VALIDATION CHECKLIST:
Before responding, verify:
□ JSON is valid and parseable
□ Exactly one correct answer per question
□ All questions relate to the specified topic
□ Difficulty level is appropriate and consistent
□ No duplicate or nearly identical questions
□ All required fields are present and properly formatted
□ Content is educational and appropriate
`,
};

export class PromptBuilder {
  static getDifficultyGuidelines(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return `   - Use straightforward questions with obvious correct answers
   - Include basic concepts and definitions
   - Avoid tricky or ambiguous phrasing
   - Questions should be answerable with fundamental knowledge
   - Use simple, clear language that's easy to understand
   
   EASY EXAMPLES:
   - "What is the capital of France?" (Geography)
   - "Which planet is closest to the Sun?" (Science)
   - "Who wrote Romeo and Juliet?" (Literature)`;
      case "medium":
        return `   - Include some analytical thinking and application of concepts
   - Mix of factual and reasoning questions
   - Moderate complexity in language and concepts
   - Questions may require connecting multiple pieces of information
   - Balance between recall and understanding
   
   MEDIUM EXAMPLES:
   - "Which factor most contributed to the fall of the Roman Empire?" (History)
   - "What happens when you mix an acid and a base?" (Science)
   - "Which literary device is used in 'The wind whispered'?" (Literature)`;
      case "hard":
        return `   - Require deep understanding and critical thinking
   - Include complex scenarios and edge cases
   - Challenge advanced knowledge of the topic
   - Questions may involve analysis, synthesis, or evaluation
   - May require expert-level knowledge or specialized understanding
   
   HARD EXAMPLES:
   - "Which economic theory best explains stagflation?" (Economics)
   - "What is the primary cause of quantum decoherence?" (Physics)
   - "Which narrative technique defines stream of consciousness?" (Literature)`;
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
    "You are an expert quiz creator with deep knowledge across multiple domains. Your specialty is creating engaging, accurate, and well-structured educational quizzes that provide an excellent learning experience. You MUST respond with valid JSON only.",
  user: `Create a {difficulty} difficulty quiz with the following specifications:

{jsonValidation}

EDGE CASE HANDLING:
- If the topic is too broad, focus on the most important/popular aspects
- If the topic is too narrow for {questionCount} questions, create the best questions possible and note in description
- If you lack sufficient knowledge, focus on widely-known facts and clearly indicate uncertainty in description
- Prioritize accuracy over quantity - better fewer good questions than many poor ones

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
   - Prioritize clarity over creativity when they conflict
   - Do not include "quiz" or "quiz on" in the title
2. For {difficulty} difficulty:
{difficultyGuidelines}
3. ACCURACY IS PARAMOUNT - incorrect answers will create poor user experience
4. Generate exactly {questionCount} questions with {optionsCount} options each
5. Ensure all content relates to: "{prompt}"
6. Number order_index starting from 0

{questionQuality}

{optionQuality}

{selfValidation}

Generate the quiz now:`,
};

export class CreativePromptGenerator {
  private static readonly SIMPLE_TOPICS = [
    // Geography & Places
    "European capital cities", "African countries", "US state flags", "World landmarks", 
    "Mountain ranges", "Famous rivers", "Island nations", "Desert locations",
    
    // Animals & Nature
    "Ocean animals", "Jungle creatures", "Bird species", "Dog breeds", 
    "Farm animals", "Endangered species", "Prehistoric animals", "Pet care",
    
    // Food & Cooking
    "Italian dishes", "Breakfast foods", "Tropical fruits", "Cooking methods",
    "World cuisines", "Desserts", "Spices and herbs", "Fast food chains",
    
    // Entertainment & Media
    "Disney movies", "Classic TV shows", "Video game characters", "Movie genres",
    "Music instruments", "Famous bands", "Board games", "Cartoon characters",
    
    // Sports & Games
    "Olympic sports", "Baseball teams", "Soccer rules", "Winter sports",
    "Card games", "Famous athletes", "Sports equipment", "Game rules",
    
    // Science & Technology
    "Solar system", "Human body", "Weather patterns", "Simple machines",
    "Smartphone features", "Internet basics", "Computer parts", "Car components",
    
    // History & Culture
    "Ancient Egypt", "Medieval times", "American presidents", "World War facts",
    "Famous explorers", "Traditional holidays", "Cultural traditions", "Historical inventions",
    
    // Everyday Life
    "Household items", "Clothing types", "School subjects", "Job professions",
    "Transportation", "City features", "Shopping items", "Home appliances"
  ];

  static generateVariedPrompt(): string {
    // Use proper randomization for variety
    const randomIndex1 = Math.floor(Math.random() * this.SIMPLE_TOPICS.length);
    let randomIndex2 = Math.floor(Math.random() * this.SIMPLE_TOPICS.length);
    
    // Ensure fallback is different from primary
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * this.SIMPLE_TOPICS.length);
    }
    
    const primaryTopic = this.SIMPLE_TOPICS[randomIndex1];
    const fallbackTopic = this.SIMPLE_TOPICS[randomIndex2];
    
    return `Generate a simple, accessible quiz topic that people will enjoy.

REQUIREMENTS:
- Keep it simple and familiar - topics that most people can relate to
- Avoid complex, poetic, or fancy language
- Use clear, straightforward descriptions
- Make it educational but not intimidating
- Topics should be fun and engaging for a general audience

SUGGESTED AREAS (pick one or similar):
Primary suggestion: "${primaryTopic}"
Alternative suggestion: "${fallbackTopic}"

OTHER GOOD EXAMPLES:
- "Movie actors from the 90s"
- "Basic math concepts" 
- "Popular dog breeds"
- "Common kitchen tools"
- "Famous landmarks"
- "Types of weather"
- "School subjects"
- "Breakfast cereals"

AVOID:
- Overly academic or scholarly topics
- Complex scientific terminology
- Poetic or artistic language
- Obscure or niche subjects
- Topics with dramatic phrases like "secrets of" or "mysteries"

FORMAT: Return only a simple topic title (maximum 6 words), nothing else.

Examples of GOOD responses:
"Popular TV shows from the 2000s"
"Common birds in North America"
"Basic cooking techniques"

Examples of BAD responses:
"Whispered Secrets of Ancient Gastronomy"
"The Enigmatic Dance of Molecular Structures"
"Hidden Narratives in Suburban Architecture"

Generate a simple, friendly topic now:`;
  }
}

export const CREATIVE_QUIZ_PROMPT: PromptTemplate = {
  system:
    "You are a helpful assistant that generates simple, accessible quiz topics that people will enjoy. Focus on familiar subjects that are educational but not intimidating. Avoid complex or overly academic language.",
  user: CreativePromptGenerator.generateVariedPrompt(),
};

export const ADDITIONAL_QUESTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an expert quiz creator specializing in maintaining consistency and flow within quiz sets while introducing fresh and engaging content. You MUST respond with valid JSON only.",
  user: `Generate {count} additional questions for an existing quiz.

{jsonValidation}

EDGE CASE HANDLING:
- If requesting more questions than the topic can reasonably support, generate fewer high-quality questions
- Ensure new questions complement rather than duplicate existing content
- If the existing questions suggest a specific subtopic focus, maintain that focus

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
2. Avoid duplicating existing questions or concepts
3. Ensure questions complement and enhance the existing quiz
4. Number order_index starting from 0
5. Maintain consistency with existing question style and difficulty

{questionQuality}

{optionQuality}

{selfValidation}

Generate the questions now:`,
};

export const QUESTION_ENHANCEMENT_PROMPT: PromptTemplate = {
  system:
    "You are an expert educational content editor with a focus on clarity, engagement, and pedagogical effectiveness. Your specialty is improving quiz questions while maintaining their educational value. You MUST respond with valid JSON only.",
  user: `Enhance the following question to make it clearer, more engaging, and better suited for the quiz difficulty level.

{jsonValidation}

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
5. Keep reasoning concise (1-2 sentences)
6. When clarity and engagement conflict, prioritize clarity

ENHANCEMENT FOCUS AREAS:
- Improve clarity and readability (primary goal)
- Make appropriately engaging for educational context
- Ensure question matches target difficulty level
- Fix grammatical issues or awkward wording
- Remove ambiguous or confusing phrasing
- Use active voice when possible
- Ensure question is self-contained

{selfValidation}

Enhance the question now:`,
};

export const ADDITIONAL_OPTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an expert quiz creator with a specialty in crafting plausible distractors that test understanding while avoiding common pitfalls in multiple-choice design. You MUST respond with valid JSON only.",
  user: `Generate {optionsCount} additional INCORRECT answer options for this question.

{jsonValidation}

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
2. Options should be plausible distractors that test understanding
3. Match the style and length of existing options
4. Number order_index starting from 0
5. Focus on common misconceptions rather than random wrong answers

{optionQuality}

SPECIFIC REQUIREMENTS:
- Options should represent common wrong answers or misconceptions
- Use the same tone and style as existing options
- Ensure options are relevant to the question and topic
- Make sure options are not obviously wrong or absurd

{selfValidation}

Generate the options now:`,
};

export const QUESTION_TYPE_SUGGESTIONS_PROMPT: PromptTemplate = {
  system:
    "You are an educational design expert with deep knowledge of assessment methodologies and question taxonomies. Your specialty is suggesting diverse question types that comprehensively evaluate understanding. You MUST respond with valid JSON only.",
  user: `Suggest 5 different question types that would work well for a {difficulty} quiz about "{topic}".

{jsonValidation}

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
4. Descriptions should be clear and helpful (1-2 sentences)
5. Focus on practical, actionable suggestions

SUGGESTION QUALITY REQUIREMENTS:
- Ensure each suggestion type is clearly different from others
- Example questions should be concise (15-20 words maximum)
- Focus on question types that work well for multiple choice format
- Suggestions should cover different cognitive aspects of the topic
- Examples should be appropriately challenging for the difficulty level
- Avoid overly complex or academic question types
- Make sure suggestions are relevant to the specific topic provided

{selfValidation}

Generate the suggestions now:`,
};

export const SECURITY_CHECK_PROMPT: PromptTemplate = {
  system:
    "You are a content safety specialist with expertise in educational content moderation. Your role is to ensure quiz content meets high standards for safety, quality, and educational value while being fair and constructive in your evaluations. You MUST respond with valid JSON only.",
  user: `Review this user-generated quiz content for quality and safety.

{jsonValidation} 

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
- confidence should be a number between 0-100 (higher = more confident in decision)
- concerns should be an array of specific issues (empty array if none)
- Keep reasoning concise but informative (1-2 sentences)
- Be fair and constructive - don't reject content for minor issues

{selfValidation}

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
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines)
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(
        /{questionQuality}/g,
        SHARED_QUALITY_REQUIREMENTS.QUESTION_QUALITY
      )
      .replace(/{optionQuality}/g, SHARED_QUALITY_REQUIREMENTS.OPTION_QUALITY)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
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
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines)
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(
        /{questionQuality}/g,
        SHARED_QUALITY_REQUIREMENTS.QUESTION_QUALITY
      )
      .replace(/{optionQuality}/g, SHARED_QUALITY_REQUIREMENTS.OPTION_QUALITY)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
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
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines)
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
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
      .replace(/{optionsCount}/g, optionsCount.toString())
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(/{optionQuality}/g, SHARED_QUALITY_REQUIREMENTS.OPTION_QUALITY)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
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
      .replace(/{difficultyGuidelines}/g, difficultyGuidelines)
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
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
      .replace(/{questions}/g, questionsText)
      .replace(/{jsonValidation}/g, SHARED_QUALITY_REQUIREMENTS.JSON_VALIDATION)
      .replace(
        /{selfValidation}/g,
        SHARED_QUALITY_REQUIREMENTS.SELF_VALIDATION
      );
  }
}
