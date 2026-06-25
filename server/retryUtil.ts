/**
 * Retry utility with exponential backoff and timeout handling.
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  timeoutMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 2000, // Starts at 2s as requested
  maxDelayMs: 16000,
  backoffFactor: 2, // Doubles each time: 2s, 4s, 8s, 16s...
  timeoutMs: 30000, // 30 second timeout per request
};

/**
 * Custom error class for API errors
 */
export class GeminiAPIError extends Error {
  public code?: number;
  public status?: string;
  public isRetryable: boolean;

  constructor(message: string, options: { code?: number; status?: string; isRetryable?: boolean } = {}) {
    super(message);
    this.name = "GeminiAPIError";
    this.code = options.code;
    this.status = options.status;
    
    // Auto-detect if retryable based on code, status, or message contents
    const is503 = options.code === 503 || options.status === "UNAVAILABLE";
    const is429 = options.code === 429 || options.status === "RESOURCE_EXHAUSTED";
    const messageRetryable = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|busy|try again|timed out|timeout|network|fetch/i.test(message);
    
    this.isRetryable = options.isRetryable ?? (is503 || is429 || messageRetryable);
  }
}

/**
 * Execute an async operation with timeout
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage = "Request timed out"): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Helper delay function
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a function with retries and exponential backoff
 */
export async function executeWithRetry<T>(
  fn: (attempt: number) => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any = null;
  let delayMs = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      // Execute the function wrapped in a timeout
      return await withTimeout(
        fn(attempt),
        finalConfig.timeoutMs,
        `Gemini API request timed out after ${finalConfig.timeoutMs}ms`
      );
    } catch (err: any) {
      lastError = err;
      
      // Wrap/classify error
      const geminiError = new GeminiAPIError(
        err.message || String(err),
        {
          code: err.status || err.code || err.statusCode,
          status: err.statusText || (err.error && err.error.status),
        }
      );

      console.error(
        `[Retry Utility] Attempt ${attempt}/${finalConfig.maxRetries} failed. Error: ${geminiError.message}. Code: ${geminiError.code}, Status: ${geminiError.status}. Retryable: ${geminiError.isRetryable}`
      );

      // If the error is not retryable and we have no fallback options, fail early
      if (!geminiError.isRetryable) {
        console.warn("[Retry Utility] Non-retryable error encountered. Escalating immediately.");
        throw geminiError;
      }

      if (attempt === finalConfig.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and absolute bounds
      const currentDelay = Math.min(delayMs, finalConfig.maxDelayMs);
      console.log(`[Retry Utility] Backing off. Waiting ${currentDelay}ms before retry...`);
      await delay(currentDelay);
      
      // Update delay for next iteration
      delayMs *= finalConfig.backoffFactor;
    }
  }

  // If we reach here, we've exhausted all retries
  throw lastError || new Error("Operation failed after maximum retries");
}
