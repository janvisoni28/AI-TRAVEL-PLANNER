import { GoogleGenAI } from "@google/genai";
import { executeWithRetry, GeminiAPIError } from "./retryUtil.js";

// Models list in priority order, avoiding deprecated models like gemini-2.0-flash and gemini-1.5-flash
const MODELS = [
  "gemini-2.5-flash", 
  "gemini-3.5-flash", 
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

// Circuit Breaker State
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastStateChange: number = Date.now();
  
  // Settings
  private failureThreshold = 3; // consecutive failures before tripping
  private successThreshold = 2; // consecutive successes needed in HALF_OPEN to close
  private cooldownPeriodMs = 30000; // cooldown for 30 seconds

  public getState(): CircuitState {
    // If state is OPEN, check if cooldown has passed to go HALF_OPEN
    if (this.state === "OPEN" && Date.now() - this.lastStateChange > this.cooldownPeriodMs) {
      this.transitionTo("HALF_OPEN");
    }
    return this.state;
  }

  public onSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transitionTo("CLOSED");
      }
    }
  }

  public onFailure() {
    this.failureCount++;
    this.successCount = 0;
    if (this.state === "CLOSED" && this.failureCount >= this.failureThreshold) {
      this.transitionTo("OPEN");
    } else if (this.state === "HALF_OPEN") {
      this.transitionTo("OPEN");
    }
  }

  private transitionTo(newState: CircuitState) {
    console.warn(`[Circuit Breaker] Transitioning from ${this.state} to ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();
    if (newState === "CLOSED") {
      this.failureCount = 0;
      this.successCount = 0;
    }
  }
}

// Request Queue / Concurrency Limiter
class RequestQueue {
  private activeCount = 0;
  private queue: (() => void)[] = [];
  private maxConcurrency = 2; // Allow maximum 2 concurrent Gemini calls to prevent 429 rate limit spikes

  public async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrency) {
      console.log(`[Request Queue] Max concurrency reached. Queuing request. Queue size: ${this.queue.length + 1}`);
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) {
        console.log(`[Request Queue] Releasing next queued task. Remaining in queue: ${this.queue.length}`);
        next();
      }
    }
  }
}

// Instantiate Service Singletons
const breaker = new CircuitBreaker();
const queue = new RequestQueue();

// Initialize the primary Google GenAI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build-prod",
    },
  },
});

/**
 * Service to interface with Gemini with top-tier reliability,
 * retries, fallback models, concurrency limit, and circuit breaking.
 */
export class GeminiService {
  /**
   * Safe wrapper that handles models, queue, breaker, retries, and errors
   */
  public static async generateContent(params: {
    contents: any;
    config?: any;
    promptDescription?: string;
  }): Promise<{ text: string; modelUsed: string }> {
    const currentState = breaker.getState();
    const actionLabel = params.promptDescription || "AI request";

    if (currentState === "OPEN") {
      console.error(`[GeminiService] Circuit Breaker is OPEN. Fast-failing ${actionLabel}`);
      throw new GeminiAPIError(
        "AI service is currently busy. Please try again in a few minutes.",
        { code: 503, status: "UNAVAILABLE", isRetryable: false }
      );
    }

    return await queue.run(async () => {
      let modelIndex = 0;
      let lastError: any = null;

      // Iterate through fallback models
      while (modelIndex < MODELS.length) {
        const modelName = MODELS[modelIndex];
        console.log(`[GeminiService] Processing ${actionLabel} using ${modelName}`);

        try {
          // Attempt generation using retry utility for this model
          const response = await executeWithRetry(
            async (attempt) => {
              console.log(`[GeminiService] Model: ${modelName} | Attempt: ${attempt}`);
              const result = await ai.models.generateContent({
                model: modelName,
                contents: params.contents,
                config: params.config,
              });

              if (!result || !result.text) {
                throw new Error("Received an empty or malformed response text from model.");
              }

              return result;
            },
            {
              maxRetries: 3, // 3 retries per model to speed up fallback transition if unavailable
            }
          );

          // Success!
          breaker.onSuccess();
          console.log(`[GeminiService] Generation succeeded using model: ${modelName}`);
          return {
            text: response.text!,
            modelUsed: modelName,
          };
        } catch (error: any) {
          console.error(`[GeminiService] Model ${modelName} failed or exhausted retries:`, error.message || error);
          lastError = error;
          
          // Switch to the next fallback model
          modelIndex++;
        }
      }

      // If we made it here, all fallback models have failed
      breaker.onFailure();
      console.error(`[GeminiService] All model fallbacks failed for ${actionLabel}`);

      // Map to a beautifully readable user friendly error
      throw new GeminiAPIError(
        "AI service is currently busy. Please try again in a few minutes.",
        { code: 503, status: "UNAVAILABLE", isRetryable: false }
      );
    });
  }
}
