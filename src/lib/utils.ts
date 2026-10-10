import type { Json } from "@/types/database.types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

/** Serializes a plain object to a Postgres `Json` value (drops undefined fields, like JSON.stringify). */
export function toJson(value: object): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}
