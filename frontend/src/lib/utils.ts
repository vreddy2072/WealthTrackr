import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string to a localized date string
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str The string to truncate
 * @param length The maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generates a random ID
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounces a function
 * @param fn The function to debounce
 * @param ms The debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
