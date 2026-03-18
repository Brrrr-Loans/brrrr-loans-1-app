/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const csvRows: string[] = [];

  // Get headers from first object
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];

      // Handle null/undefined
      if (value == null) return "";

      // Convert to string and escape quotes
      let stringValue = String(value);

      // Escape double quotes by doubling them
      stringValue = stringValue.replace(/"/g, '""');

      // Wrap in quotes if contains comma, newline, or quote
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue}"`;
      }

      return stringValue;
    });

    csvRows.push(values.join(","));
  }

  // Create CSV string
  const csvString = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

import type { TransactionWithDetails } from "@/types/transactions";

/**
 * Format transaction data for CSV export
 */
export function formatTransactionsForExport(
  transactions: TransactionWithDetails[]
): Record<string, string | number>[] {
  return transactions.map((tx) => ({
    Date: tx.transaction_date ?? "",
    From:
      tx.investors?.[0]?.auth_clerk_users?.full_name ||
      tx.investors?.[0]?.auth_clerk_orgs?.clerk_org_name ||
      (Number(tx.transaction_amount) > 0 ? "Brrrr Loans 1 LLC" : "Unknown"),
    To:
      Number(tx.transaction_amount) > 0
        ? tx.investors?.[0]?.auth_clerk_users?.full_name ||
          tx.investors?.[0]?.auth_clerk_orgs?.clerk_org_name ||
          "Unknown"
        : "Brrrr Loans 1 LLC",
    "Transaction Type": tx.transaction_method?.toUpperCase() || "N/A",
    Status: tx.transaction_status || "N/A",
    Amount: Math.abs(Number(tx.transaction_amount) || 0).toFixed(2),
    "Reference Number": tx.reference_number || "",
    Notes: tx.external_memo || "",
  }));
}
