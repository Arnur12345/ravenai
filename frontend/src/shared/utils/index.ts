// Export all utility functions
export * from './formatting';
export * from './error-handler';

// Class name utility function for merging Tailwind classes
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 