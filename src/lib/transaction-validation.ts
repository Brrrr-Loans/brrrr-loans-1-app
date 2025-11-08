/**
 * Validation utilities for BSI transactions
 */

export interface AllocationValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate that allocations sum to the transaction amount
 */
export function validateTransactionAllocations(
  transactionAmount: number,
  dealAllocations: Array<{ amount: number }>,
  investorAllocations: Array<{ amount: number }>
): AllocationValidationResult {
  const errors: string[] = [];

  // Check that we have at least one allocation of each type
  if (dealAllocations.length === 0) {
    errors.push("At least one deal allocation is required");
  }

  if (investorAllocations.length === 0) {
    errors.push("At least one investor allocation is required");
  }

  // Calculate sums
  const dealSum = dealAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const investorSum = investorAllocations.reduce(
    (sum, alloc) => sum + alloc.amount,
    0
  );

  // Check that deal allocations sum to transaction amount (within 1 cent tolerance)
  if (Math.abs(dealSum - transactionAmount) > 0.01) {
    errors.push(
      `Deal allocations sum ($${dealSum.toFixed(2)}) must equal transaction amount ($${transactionAmount.toFixed(2)})`
    );
  }

  // Check that investor allocations sum to transaction amount (within 1 cent tolerance)
  if (Math.abs(investorSum - transactionAmount) > 0.01) {
    errors.push(
      `Investor allocations sum ($${investorSum.toFixed(2)}) must equal transaction amount ($${transactionAmount.toFixed(2)})`
    );
  }

  // Check for negative amounts
  dealAllocations.forEach((alloc, index) => {
    if (alloc.amount < 0) {
      errors.push(`Deal allocation ${index + 1} cannot be negative`);
    }
  });

  investorAllocations.forEach((alloc, index) => {
    if (alloc.amount < 0) {
      errors.push(`Investor allocation ${index + 1} cannot be negative`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a complete transaction before creation
 */
export function validateTransaction(transaction: {
  amount: number;
  dealAllocations: Array<{ dealId: number; amount: number }>;
  investorAllocations: Array<{ investorId: number; amount: number }>;
}): AllocationValidationResult {
  const errors: string[] = [];

  // Validate transaction amount
  if (transaction.amount <= 0) {
    errors.push("Transaction amount must be greater than zero");
  }

  // Validate allocations
  const allocationResult = validateTransactionAllocations(
    transaction.amount,
    transaction.dealAllocations,
    transaction.investorAllocations
  );

  if (!allocationResult.isValid) {
    errors.push(...allocationResult.errors);
  }

  // Check for duplicate deals
  const dealIds = transaction.dealAllocations.map((a) => a.dealId);
  const uniqueDealIds = new Set(dealIds);
  if (dealIds.length !== uniqueDealIds.size) {
    errors.push("Duplicate deal allocations are not allowed");
  }

  // Check for duplicate investors
  const investorIds = transaction.investorAllocations.map((a) => a.investorId);
  const uniqueInvestorIds = new Set(investorIds);
  if (investorIds.length !== uniqueInvestorIds.size) {
    errors.push("Duplicate investor allocations are not allowed");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
