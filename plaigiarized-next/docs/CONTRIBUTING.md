# Contributing Guide

## Code Standards

### TypeScript Guidelines

- Use strict type checking
- Document public APIs
- Write unit tests for all features
- Follow ESLint configuration

### Component Structure

```typescript
// Good
import React from 'react';
import type { ComponentProps } from './types';

export const MyComponent: React.FC<ComponentProps> = ({
  prop1,
  prop2
}) => {
  // Implementation
};
```

## Testing Requirements

1. Unit Tests:
- All services must have unit tests
- Mock external dependencies
- Test edge cases

2. Integration Tests:
- Test service interactions
- Verify workflow correctness

3. E2E Tests:
- Test complete user flows
- Verify UI interactions

## Pull Request Process

1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with:
   - Description
   - Test results
   - Performance impact
   - Breaking changes

## Architecture Decisions

### Service Layer

Services should:
- Be stateless
- Use dependency injection
- Handle errors gracefully
- Be testable in isolation

### Database Access

- Use Prisma for database access
- Write migrations for schema changes
- Include up/down migrations
- Test with isolated database 