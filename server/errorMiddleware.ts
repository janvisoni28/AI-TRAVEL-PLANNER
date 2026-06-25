import { Request, Response, NextFunction } from "express";

/**
 * Standard API error response format
 */
export interface APIErrorResponse {
  error: string;
  code?: number;
  status?: string;
  timestamp: string;
}

/**
 * Global Express error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  
  // Log detailed error context to server logs
  console.error(`[Error Middleware] Handled error in ${req.method} ${req.url}:`);
  console.error(`Message: ${err.message}`);
  console.error(`Stack: ${err.stack || "No stack trace available"}`);
  if (err.code || err.status) {
    console.error(`Code: ${err.code} | Status: ${err.status}`);
  }

  // Handle special Gemini API errors
  if (err.name === "GeminiAPIError" || err.message?.includes("Gemini") || err.message?.includes("busy")) {
    const isBusy = err.message?.includes("busy") || err.code === 503;
    const responseBody: APIErrorResponse = {
      error: isBusy
        ? "AI service is currently busy. Please try again in a few minutes."
        : err.message || "Failed to generate AI content.",
      code: err.code || 503,
      status: err.status || "UNAVAILABLE",
      timestamp,
    };
    return res.status(responseBody.code || 503).json(responseBody);
  }

  // Generic fallback error
  const responseBody: APIErrorResponse = {
    error: err.message || "An unexpected server error occurred.",
    code: err.status || err.code || 500,
    timestamp,
  };
  return res.status(responseBody.code || 500).json(responseBody);
}
