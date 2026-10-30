import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config";

type AiProvider = "gemini-resume" | "gemini-general"

type UsageEntry = {
  total: number;
  currentMinute: number;
  lastUsedAt: string | null;
};

const usage = new Map<string, UsageEntry>();
let usageWindowStartedAt = Date.now();

function resetUsageWindowIfNeeded() {
  if (Date.now() - usageWindowStartedAt >= 60_000) {
    usageWindowStartedAt = Date.now();
    for (const entry of usage.values()) entry.currentMinute = 0;
  }
}

export function recordAiCall(provider: AiProvider, operation: string) {
  resetUsageWindowIfNeeded();
  const key = `${provider}:${operation}`;
  const entry = usage.get(key) ?? { total: 0, currentMinute: 0, lastUsedAt: null };
  entry.total += 1;
  entry.currentMinute += 1;
  entry.lastUsedAt = new Date().toISOString();
  usage.set(key, entry);
}

export interface AiRetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  factor?: number;
}

export function isTransientAiError(error: unknown): boolean {
  if (!error) return false;

  // Check explicit status code properties
  let status: number | undefined;
  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.status === "number") {
      status = err.status;
    } else if (typeof err.statusCode === "number") {
      status = err.statusCode;
    } else if (
      typeof err.response === "object" &&
      err.response !== null &&
      typeof (err.response as Record<string, unknown>).status === "number"
    ) {
      status = (err.response as Record<string, unknown>).status as number;
    }
  }

  // Strictly non-transient for 4xx client errors (400-499)
  if (status !== undefined && status >= 400 && status < 500 && status !== 429) {
    return false;
  }

  // Transient if 503
  if (status === 503 || status === 429) {
    return true;
  }

  // Check message strings
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as Record<string, unknown>).message === "string"
      ? ((error as Record<string, unknown>).message as string)
      : "";

  if (!message) return false;

  // If message explicitly specifies client error 4xx and not 503, return false
  if (/\b(400|401|403|404|405|422)\b/.test(message) && !/\b503\b/.test(message)) {
    return false;
  }

  // Check for transient indicators: 503, overloaded, high demand, service unavailable, temporarily unavailable
  const transientRegex = /\b(503|429)\b|rate limit|quota|too many requests|overloaded|high demand|service unavailable|temporarily unavailable/i;
  return transientRegex.test(message);
}

export async function withAiRetry<T>(
  operation: () => Promise<T>,
  options?: AiRetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelayMs =
    options?.initialDelayMs ??
    (process.env.AI_RETRY_INITIAL_DELAY_MS
      ? Number(process.env.AI_RETRY_INITIAL_DELAY_MS)
      : 1000);
  const factor = options?.factor ?? 2;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAiError(error) || attempt >= maxRetries) {
        throw error;
      }
      const delay = initialDelayMs * Math.pow(factor, attempt);
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export function createGeminiModel(
  apiKey: string,
  model = config.geminiModel,
) {
  return new ChatGoogleGenerativeAI({
    apiKey,
    model,
    temperature: 0.3,
    maxRetries: 0,
  });
}

export function getAiHealth() {
  resetUsageWindowIfNeeded();
  return {
    model: config.geminiModel,
    configured: {
      geminiResume: Boolean(config.geminiApiKey),
      geminiGeneral: Boolean(config.geminiApiKey2),
    },
    usage: Object.fromEntries(
      [...usage.entries()].map(([operation, entry]) => [operation, { ...entry }]),
    ),
    usageWindow: {
      startedAt: new Date(usageWindowStartedAt).toISOString(),
      durationSeconds: 60,
    },
  };
}
