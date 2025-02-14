# API Documentation

## Authentication

### Endpoints

#### POST /api/auth/login
Authenticates a user and returns a JWT token.

```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  token: string;
  user: {
    id: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  }
}
```

### Error Codes
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

## Document Analysis

### POST /api/analysis/submit
Submits a document for plagiarism analysis.

```typescript
// Request
{
  content: string;
  studentId: string;
  courseId: string;
  metadata?: {
    title?: string;
    dueDate?: string;
  }
}

// Response
{
  submissionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  timestamp: string;
}
```

### GET /api/analysis/results/:submissionId
Retrieves analysis results for a submission.

```typescript
// Response
{
  metrics: WritingMetrics;
  similarity: number;
  confidence: number;
  matches: Array<{
    sourceId: string;
    similarity: number;
    segments: Array<{
      text: string;
      similarity: number;
    }>;
  }>;
}
``` 