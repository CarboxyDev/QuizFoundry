# Gemini AI Setup Guide

This guide will help you set up Google's Gemini AI API for quiz generation in your backend.

## 📋 Prerequisites

- Google Account
- Access to Google AI Studio
- Backend environment already set up

## 🔑 Getting Your Gemini API Key

### Step 1: Access Google AI Studio

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Accept the terms of service if prompted

### Step 2: Create an API Key

1. Click on "Get API Key" in the left sidebar
2. Click "Create API Key"
3. Choose "Create API key in new project" (recommended) or select an existing project
4. Your API key will be generated automatically
5. **Important**: Copy the API key immediately and store it securely

### Step 3: Configure Rate Limits (Optional)

1. In Google AI Studio, go to "API Keys" section
2. Click on your API key to configure settings
3. Set appropriate rate limits based on your usage needs
4. Save your changes

## ⚙️ Backend Configuration

### Step 1: Add Environment Variable

Add your Gemini API key to your backend environment:

**Option A: Create/Update `.env` file in backend directory**

```bash
# Add this line to backend/.env
GEMINI_API_KEY=your_api_key_here
```

**Option B: Set environment variable directly**

```bash
export GEMINI_API_KEY=your_api_key_here
```

### Step 2: Install Dependencies

The required package is already added to package.json. Install it:

```bash
cd backend
pnpm install
```

### Step 3: Run Database Migration

#### For Cloud-Hosted Supabase (Most Common)

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "SQL Editor" in the left sidebar
4. Create a new query
5. Copy the entire contents of `supabase/migrations/20250630000000_add_quiz_tables.sql`
6. Paste it into the SQL editor
7. Click "Run" to execute the migration

**Option B: Using Supabase CLI with Cloud Project**

```bash
# First, link your local project to your cloud project (if not already done)
# You can find YOUR_PROJECT_REF in your Supabase dashboard under Settings > General
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration to your cloud database
supabase db push
```

#### For Local Supabase Development

Apply the new quiz tables migration:

```bash
# From the project root
cd supabase
supabase db reset  # This will apply all migrations including the new quiz tables
```

Or if you prefer to apply just the new migration:

```bash
supabase migration up
```

## 🧪 Testing the Setup

### Step 1: Start the Backend

```bash
cd backend
pnpm run dev
```

### Step 2: Test Quiz Generation

Use your frontend or test with curl:

```bash
curl -X POST http://localhost:8080/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -d '{
    "prompt": "Create a quiz about the solar system for middle school students",
    "difficulty": "medium",
    "optionsCount": 4,
    "questionCount": 5
  }'
```

## 🔒 Security Best Practices

### 1. API Key Security

- **Never commit your API key to version control**
- Store it in environment variables only
- Use different API keys for development and production
- Regularly rotate your API keys

### 2. Rate Limiting

- Monitor your API usage in Google AI Studio
- Implement rate limiting on your endpoints if needed
- Set up alerts for unusual usage patterns

### 3. Error Handling

- The backend already includes comprehensive error handling
- Monitor logs for API failures
- Have fallback mechanisms for when the AI service is unavailable

## 📊 Usage Monitoring

### Google AI Studio Dashboard

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Go to "API Keys" section
3. Click on your API key to view usage statistics
4. Monitor requests, tokens used, and error rates

### Backend Logs

The backend logs all AI requests and responses. Check your console for:

- `Sending prompt to Gemini AI: [prompt]`
- `Received response from Gemini AI: [response]`
- Any error messages from the AI service

## 🚨 Troubleshooting

### Common Issues

**1. "Gemini API key is not configured" Error**

- Ensure GEMINI_API_KEY is set in your environment
- Restart the backend server after adding the environment variable
- Check for typos in the environment variable name

**2. "Failed to generate quiz" Error**

- Check your API key is valid and active
- Verify you haven't exceeded rate limits
- Check the backend logs for detailed error messages

**3. "Failed to parse AI response" Error**

- This can happen if the AI returns unexpected JSON format
- Check the backend logs to see the raw AI response
- The system will automatically retry with a cleaner prompt

**4. Database Errors**

- Ensure you've run the database migration
- Check that your Supabase connection is working
- Verify the user is authenticated and has completed onboarding

### Getting Help

If you encounter issues:

1. Check the backend console logs for detailed error messages
2. Verify your API key in Google AI Studio
3. Test with a simple prompt first
4. Check your database connection and migrations

## 🎯 API Endpoints Available

Once setup is complete, you'll have access to these endpoints:

- `POST /api/quizzes/generate` - Generate a quiz with AI
- `GET /api/quizzes/my` - Get user's quizzes
- `GET /api/quizzes/public` - Get public quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/questions` - Add question to quiz

## 🔄 Next Steps

After completing this setup:

1. **Test the frontend integration** - Use the create quiz page you built
2. **Set up production environment** - Get a separate API key for production
3. **Configure monitoring** - Set up alerts for API usage and errors
4. **Optimize prompts** - Fine-tune the AI prompts based on results
5. **Add features** - Consider adding quiz regeneration, question editing, etc.

---

✅ **You're all set!** Your backend now supports AI-powered quiz generation using Google's Gemini API.
