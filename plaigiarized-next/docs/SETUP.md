# Setup Guide

## Environment Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/plagiarism
REDIS_URL=redis://localhost:6379
AI_API_KEY=your_api_key
```

3. Initialize database:
```bash
npx prisma migrate dev
```

## Development Workflow

1. Start development server:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

3. Build for production:
```bash
npm run build
```

## Service Dependencies

- PostgreSQL (>= 14.0)
- Redis (>= 6.0)
- Node.js (>= 18.0)
- OpenAI API access

## Monitoring Setup

1. Configure Prometheus metrics:
```typescript
// monitoring/metrics.ts
import { register, Counter } from 'prom-client';

export const analysisCounter = new Counter({
  name: 'plagiarism_analysis_total',
  help: 'Total number of plagiarism analyses performed'
});
```

2. Set up Grafana dashboards (templates in /monitoring) 