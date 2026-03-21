interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (attempt: number) => void;
}

const defaultIsRetryable = (error: unknown): boolean => {
  const status = (error as { status?: number }).status;

  if (!status) {
    return true;
  }

  if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }

  return true;
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt >= maxRetries) {
        throw error;
      }

      onRetry?.(attempt + 1);
      await delay(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }

  throw lastError;
};
