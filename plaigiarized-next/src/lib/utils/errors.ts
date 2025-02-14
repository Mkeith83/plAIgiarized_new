export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AIDetectionError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AI_DETECTION_ERROR', context);
  }
}

export class BaselineError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BASELINE_ERROR', context);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', {
      originalError: error.name,
      stack: error.stack
    });
  }
  
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', {
    originalError: error
  });
} 