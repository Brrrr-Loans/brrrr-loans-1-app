/**
 * Template Engine - Handlebars-based document/form template rendering
 * 
 * This utility handles:
 * - Compiling Handlebars templates
 * - Custom helpers for formatting (dates, currency, etc.)
 * - Rendering templates with data
 */

import Handlebars from "handlebars";

// Register custom Handlebars helpers
function registerHelpers() {
  // Format date helper
  // Usage: {{formatDate dateValue "MM/DD/YYYY"}}
  Handlebars.registerHelper("formatDate", (date: string | Date, format?: string) => {
    if (!date) return "";
    
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    
    // Simple format support
    if (format === "MM/DD/YYYY") {
      return d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }
    
    if (format === "MMMM DD, YYYY") {
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    
    if (format === "MM/DD/YY") {
      return d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
    
    // Default format
    return d.toLocaleDateString("en-US");
  });

  // Format currency helper
  // Usage: {{formatCurrency amount}}
  Handlebars.registerHelper("formatCurrency", (amount: number | string) => {
    if (amount === null || amount === undefined) return "$0.00";
    
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    if (Number.isNaN(num)) return "$0.00";
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  });

  // Format number helper (no currency symbol)
  // Usage: {{formatNumber value decimals}}
  Handlebars.registerHelper("formatNumber", (value: number | string, decimals = 2) => {
    if (value === null || value === undefined) return "0";
    
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) return "0";
    
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  });

  // Format percentage helper
  // Usage: {{formatPercent value decimals}}
  Handlebars.registerHelper("formatPercent", (value: number | string, decimals = 3) => {
    if (value === null || value === undefined) return "0%";
    
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) return "0%";
    
    return `${num.toFixed(decimals)}%`;
  });

  // Uppercase helper
  // Usage: {{uppercase text}}
  Handlebars.registerHelper("uppercase", (text: string) => {
    return text ? text.toUpperCase() : "";
  });

  // Lowercase helper
  // Usage: {{lowercase text}}
  Handlebars.registerHelper("lowercase", (text: string) => {
    return text ? text.toLowerCase() : "";
  });

  // Titlecase helper
  // Usage: {{titlecase text}}
  Handlebars.registerHelper("titlecase", (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });

  // Default value helper
  // Usage: {{default value "N/A"}}
  Handlebars.registerHelper("default", (value: unknown, defaultValue: string) => {
    return value !== null && value !== undefined && value !== "" 
      ? value 
      : defaultValue;
  });

  // Conditional equality helper
  // Usage: {{#ifEquals value "expected"}}...{{/ifEquals}}
  Handlebars.registerHelper("ifEquals", function(
    this: unknown,
    arg1: unknown,
    arg2: unknown,
    options: Handlebars.HelperOptions
  ) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });

  // Conditional not equals helper
  // Usage: {{#ifNotEquals value "expected"}}...{{/ifNotEquals}}
  Handlebars.registerHelper("ifNotEquals", function(
    this: unknown,
    arg1: unknown,
    arg2: unknown,
    options: Handlebars.HelperOptions
  ) {
    return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
  });

  // Greater than helper
  // Usage: {{#ifGt value 100}}...{{/ifGt}}
  Handlebars.registerHelper("ifGt", function(
    this: unknown,
    arg1: number,
    arg2: number,
    options: Handlebars.HelperOptions
  ) {
    return arg1 > arg2 ? options.fn(this) : options.inverse(this);
  });

  // Less than helper
  // Usage: {{#ifLt value 100}}...{{/ifLt}}
  Handlebars.registerHelper("ifLt", function(
    this: unknown,
    arg1: number,
    arg2: number,
    options: Handlebars.HelperOptions
  ) {
    return arg1 < arg2 ? options.fn(this) : options.inverse(this);
  });

  // Math helper
  // Usage: {{math value "+" 10}}
  Handlebars.registerHelper("math", (lvalue: number, operator: string, rvalue: number) => {
    const left = Number.parseFloat(String(lvalue));
    const right = Number.parseFloat(String(rvalue));
    
    switch (operator) {
      case "+": return left + right;
      case "-": return left - right;
      case "*": return left * right;
      case "/": return right !== 0 ? left / right : 0;
      case "%": return left % right;
      default: return left;
    }
  });

  // Join array helper
  // Usage: {{join array ", "}}
  Handlebars.registerHelper("join", (array: unknown[], separator = ", ") => {
    if (!Array.isArray(array)) return "";
    return array.join(separator);
  });

  // First item helper
  // Usage: {{first array}}
  Handlebars.registerHelper("first", (array: unknown[]) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[0];
  });

  // Last item helper
  // Usage: {{last array}}
  Handlebars.registerHelper("last", (array: unknown[]) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[array.length - 1];
  });

  // Array length helper
  // Usage: {{length array}}
  Handlebars.registerHelper("length", (array: unknown[]) => {
    if (!Array.isArray(array)) return 0;
    return array.length;
  });

  // Index helper (for use inside #each)
  // Usage: {{addOne @index}}
  Handlebars.registerHelper("addOne", (index: number) => {
    return index + 1;
  });

  // Phone number formatter
  // Usage: {{formatPhone "1234567890"}}
  Handlebars.registerHelper("formatPhone", (phone: string) => {
    if (!phone) return "";
    const cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  });

  // SSN formatter (last 4 only for security)
  // Usage: {{formatSSN "123456789"}}
  Handlebars.registerHelper("formatSSN", (ssn: string) => {
    if (!ssn) return "";
    const cleaned = String(ssn).replace(/\D/g, "");
    if (cleaned.length >= 4) {
      return `XXX-XX-${cleaned.slice(-4)}`;
    }
    return "XXX-XX-XXXX";
  });
}

// Initialize helpers on module load
let helpersRegistered = false;

function ensureHelpersRegistered() {
  if (!helpersRegistered) {
    registerHelpers();
    helpersRegistered = true;
  }
}

/**
 * Compile a Handlebars template string
 */
export function compileTemplate(templateString: string): Handlebars.TemplateDelegate {
  ensureHelpersRegistered();
  return Handlebars.compile(templateString);
}

/**
 * Render a template with data
 */
export function renderTemplate(templateString: string, data: Record<string, unknown>): string {
  ensureHelpersRegistered();
  const template = Handlebars.compile(templateString);
  return template(data);
}

/**
 * Render a pre-compiled template with data
 */
export function renderCompiledTemplate(
  template: Handlebars.TemplateDelegate,
  data: Record<string, unknown>
): string {
  ensureHelpersRegistered();
  return template(data);
}

/**
 * Extract all placeholder variables from a template string
 * Useful for building forms that collect the required data
 */
export function extractPlaceholders(templateString: string): string[] {
  const regex = /\{\{(?:#[a-z]+\s+)?([a-zA-Z_][\w.]*)/g;
  const matches = new Set<string>();
  
  let match: RegExpExecArray | null;
  while ((match = regex.exec(templateString)) !== null) {
    // Skip helper names
    const helpers = [
      "if", "unless", "each", "with",
      "formatDate", "formatCurrency", "formatNumber", "formatPercent",
      "uppercase", "lowercase", "titlecase", "default",
      "ifEquals", "ifNotEquals", "ifGt", "ifLt",
      "math", "join", "first", "last", "length", "addOne",
      "formatPhone", "formatSSN"
    ];
    
    if (!helpers.includes(match[1])) {
      matches.add(match[1]);
    }
  }
  
  return Array.from(matches).sort();
}

// Export Handlebars instance for advanced usage
export { Handlebars };
