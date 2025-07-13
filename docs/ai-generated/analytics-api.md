# Quiz Analytics API Documentation

## Overview

The Analytics API provides comprehensive insights into quiz performance, user engagement, and detailed question-level analysis. This is a read-only API that requires quiz ownership for access.

## Base URL

```
GET /api/analytics/quiz/:quizId
```

## Authentication

- **Required**: Yes
- **Type**: Bearer Token
- **Additional**: User must have completed onboarding
- **Access**: Quiz owner only

## Rate Limiting

- **Limit**: General API rate limit applies
- **Window**: 15 minutes
- **Requests**: 1000 per window

## Endpoints

### GET /api/analytics/quiz/:quizId

Get comprehensive analytics for a specific quiz.

#### Parameters

- `quizId` (path, required): UUID of the quiz to analyze

#### Response Structure

```json
{
  "success": true,
  "data": {
    "analytics": {
      "overview": {
        "totalAttempts": 150,
        "uniqueUsers": 45,
        "averageScore": 72.5,
        "averageTimeSpent": 0,
        "completionRate": 100,
        "highestScore": 95.2,
        "lowestScore": 23.8
      },
      "performance": {
        "scoreDistribution": [
          {
            "range": "0-20%",
            "count": 5,
            "percentage": 3.3
          },
          {
            "range": "21-40%",
            "count": 8,
            "percentage": 5.3
          },
          {
            "range": "41-60%",
            "count": 25,
            "percentage": 16.7
          },
          {
            "range": "61-80%",
            "count": 67,
            "percentage": 44.7
          },
          {
            "range": "81-100%",
            "count": 45,
            "percentage": 30.0
          }
        ],
        "difficultyRating": {
          "perceived": "medium",
          "actualDifficulty": 2
        }
      },
      "engagement": {
        "attemptsOverTime": [
          {
            "date": "2024-01-01",
            "count": 5
          },
          {
            "date": "2024-01-02",
            "count": 8
          }
        ],
        "topPerformers": [
          {
            "userId": "user-uuid",
            "userName": "John Doe",
            "userAvatarUrl": "https://avatar.url",
            "score": 19,
            "percentage": 95.0,
            "completedAt": "2024-01-01T10:00:00Z"
          }
        ],
        "recentActivity": {
          "last24Hours": 5,
          "last7Days": 23,
          "last30Days": 150
        }
      },
      "questions": [
        {
          "questionId": "question-uuid",
          "questionText": "What is the capital of France?",
          "orderIndex": 0,
          "correctRate": 85.3,
          "totalAnswers": 150,
          "difficulty": "easy",
          "optionAnalysis": [
            {
              "optionId": "option-uuid",
              "optionText": "Paris",
              "isCorrect": true,
              "selectedCount": 128,
              "percentage": 85.3
            },
            {
              "optionId": "option-uuid-2",
              "optionText": "London",
              "isCorrect": false,
              "selectedCount": 15,
              "percentage": 10.0
            }
          ]
        }
      ]
    }
  },
  "message": "Quiz analytics retrieved successfully"
}
```

## Analytics Metrics Explained

### Overview Metrics

- **totalAttempts**: Total number of quiz attempts
- **uniqueUsers**: Number of unique users who attempted the quiz
- **averageScore**: Average percentage score across all attempts
- **averageTimeSpent**: Average time spent (in minutes) - currently 0 as time tracking is not implemented
- **completionRate**: Percentage of attempts that were completed (currently 100% as we only track completed attempts)
- **highestScore**: Highest percentage score achieved
- **lowestScore**: Lowest percentage score achieved

### Performance Metrics

- **scoreDistribution**: Breakdown of scores into ranges with counts and percentages
- **difficultyRating**:
  - `perceived`: The difficulty level set by the quiz creator
  - `actualDifficulty`: Calculated difficulty based on performance (1=Easy, 2=Medium, 3=Hard, 4=Very Hard)

### Engagement Metrics

- **attemptsOverTime**: Daily attempt counts for the last 30 days
- **topPerformers**: Top 10 highest-scoring attempts with user information
- **recentActivity**: Attempt counts for different time periods

### Question-Level Analysis

- **correctRate**: Percentage of correct answers for each question
- **difficulty**: Calculated difficulty based on correct rate (easy: ≥80%, medium: 60-79%, hard: <60%)
- **optionAnalysis**: Selection frequency for each answer option

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Quiz ID must be a valid UUID"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "User not authenticated"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied to this quiz"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Quiz not found or access denied"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch quiz analytics"
}
```

## Usage Examples

### Basic Request

```bash
curl -X GET "http://localhost:8080/api/analytics/quiz/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### JavaScript/TypeScript Example

```typescript
import axios from "axios";

const getQuizAnalytics = async (quizId: string, token: string) => {
  try {
    const response = await axios.get(`/api/analytics/quiz/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};
```

## Database Performance

The analytics API uses several optimizations:

1. **Indexes**: Specialized indexes for time-based and quiz-specific queries
2. **Views**: Pre-computed analytics summary view for quick overview stats
3. **Functions**: Database functions for complex calculations
4. **Efficient Queries**: Minimized N+1 queries through proper joins

## Future Enhancements

1. **Time Tracking**: Implement actual time spent tracking
2. **Real-time Analytics**: WebSocket support for live analytics
3. **Comparative Analytics**: Compare performance across similar quizzes
4. **Export Functionality**: Export analytics data to CSV/PDF
5. **Historical Trends**: Long-term trend analysis beyond 30 days
