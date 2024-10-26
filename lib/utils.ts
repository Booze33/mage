import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
//import qs from "query-string";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseStringify = (value: any) => {
  try {
    if (value === undefined) {
      throw new Error("Value is undefined");
    }
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error("Failed to parse and stringify value:", error);
    return null;
  }
};

export const authFormSchema = (type: string) => z.object({
  name: type === 'signin' ? z.string().optional() : z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
