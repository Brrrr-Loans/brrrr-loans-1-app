// Error handling utilities for Supabase operations

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Supabase error codes and their meanings
export const SupabaseErrorCodes = {
  // PostgreSQL errors
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  
  // PostgREST errors
  NO_ROWS: "PGRST116",
  TOO_MANY_ROWS: "PGRST010",
  PARSE_ERROR: "PGRST100",
  JWT_INVALID: "PGRST301",
  PERMISSION_DENIED: "42501",
  
  // Custom app errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
} as const;

export function handleSupabaseError(
  error: any, 
  context: string,
  additionalContext?: Record<string, any>
): never {
  console.error(`Supabase error in ${context}:`, {
    error,
    context,
    additionalContext,
    timestamp: new Date().toISOString(),
  });

  // Handle specific PostgreSQL errors
  if (error.code === SupabaseErrorCodes.UNIQUE_VIOLATION) {
    throw new AppError(
      "A record with this information already exists",
      "DUPLICATE_ENTRY",
      409,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.FOREIGN_KEY_VIOLATION) {
    throw new AppError(
      "Referenced record not found",
      "INVALID_REFERENCE",
      400,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.NOT_NULL_VIOLATION) {
    throw new AppError(
      "Required field is missing",
      "MISSING_REQUIRED_FIELD", 
      400,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.NO_ROWS) {
    throw new AppError(
      "Record not found",
      "NOT_FOUND",
      404,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.TOO_MANY_ROWS) {
    throw new AppError(
      "Multiple records found when only one was expected",
      "MULTIPLE_RECORDS",
      409,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.JWT_INVALID) {
    throw new AppError(
      "Invalid authentication token",
      "INVALID_TOKEN",
      401,
      { context, originalError: error.message }
    );
  }

  if (error.code === SupabaseErrorCodes.PERMISSION_DENIED) {
    throw new AppError(
      "Permission denied",
      "PERMISSION_DENIED",
      403,
      { context, originalError: error.message }
    );
  }

  // Handle network and connection errors
  if (error.message?.includes("fetch")) {
    throw new AppError(
      "Database connection failed",
      "CONNECTION_ERROR",
      503,
      { context, originalError: error.message }
    );
  }

  // Handle timeout errors
  if (error.message?.includes("timeout")) {
    throw new AppError(
      "Database operation timed out",
      "TIMEOUT_ERROR",
      504,
      { context, originalError: error.message }
    );
  }

  // Generic Supabase error
  throw new AppError(
    error.message || "Database operation failed",
    "DATABASE_ERROR",
    500,
    { context, originalError: error.message }
  );
}

export function handleValidationError(
  error: Error,
  context: string
): never {
  console.error(`Validation error in ${context}:`, {
    error: error.message,
    context,
    timestamp: new Date().toISOString(),
  });

  throw new AppError(
    error.message,
    "VALIDATION_ERROR",
    400,
    { context }
  );
}

export function handleAuthError(
  message: string = "Authentication required",
  context: string
): never {
  console.error(`Auth error in ${context}:`, {
    message,
    context,
    timestamp: new Date().toISOString(),
  });

  throw new AppError(
    message,
    "UNAUTHORIZED",
    401,
    { context }
  );
}

export function handlePermissionError(
  message: string = "Insufficient permissions",
  context: string
): never {
  console.error(`Permission error in ${context}:`, {
    message,
    context,
    timestamp: new Date().toISOString(),
  });

  throw new AppError(
    message,
    "FORBIDDEN",
    403,
    { context }
  );
}

// API response helpers
export function createErrorResponse(error: AppError | Error, fallbackMessage: string = "An error occurred") {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      context: error.context,
    };
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  return {
    error: fallbackMessage,
    code: "INTERNAL_ERROR",
  };
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

// Async error wrapper for server actions
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        // Check if it's a validation error
        if (error.message.includes("must be") || error.message.includes("required") || error.message.includes("invalid")) {
          handleValidationError(error, context);
        }

        // Check if it's an auth error
        if (error.message.toLowerCase().includes("unauthorized")) {
          handleAuthError(error.message, context);
        }

        // Check if it's a permission error
        if (error.message.toLowerCase().includes("permission")) {
          handlePermissionError(error.message, context);
        }
      }

      // Handle Supabase errors
      if (error && typeof error === "object" && "code" in error) {
        handleSupabaseError(error, context);
      }

      // Generic error
      console.error(`Unexpected error in ${context}:`, error);
      throw new AppError(
        "An unexpected error occurred",
        "INTERNAL_ERROR",
        500,
        { context, originalError: String(error) }
      );
    }
  };
}

// Utility for logging operations
export function logOperation(
  operation: string,
  table: string,
  userId?: string,
  additionalData?: Record<string, any>
) {
  console.log("Database operation:", {
    operation,
    table,
    userId,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}