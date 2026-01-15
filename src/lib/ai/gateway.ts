import { createOpenAI } from "@ai-sdk/openai";

/**
 * Vercel AI Gateway client
 * 
 * Routes AI requests through Vercel's AI Gateway for:
 * - Unified billing and usage tracking
 * - Rate limiting and caching
 * - Request/response logging
 * - Multi-provider support
 * 
 * @see https://vercel.com/docs/ai-gateway
 */
export const gateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://gateway.ai.vercel.com/v1",
});

/**
 * Fallback to direct OpenAI if gateway is not configured
 * Useful for local development without gateway access
 */
export const openaiDirect = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get the appropriate AI provider based on environment
 * Prefers gateway if AI_GATEWAY_API_KEY is set, otherwise falls back to direct OpenAI
 */
export function getAIProvider() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway;
  }
  return openaiDirect;
}
