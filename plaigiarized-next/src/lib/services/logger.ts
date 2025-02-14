export class Logger {
  constructor() {
    // Initialize logger
  }

  public error(message: string, error?: unknown): void {
    console.error(message, error);
  }

  public info(message: string, ...args: unknown[]): void {
    console.info(message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  }

  debug(message: string, data?: unknown): void {
    console.debug(`[Debug] ${message}`, data);
  }
} 