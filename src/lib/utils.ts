import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalized(
  field: { pl?: string; ua?: string; en?: string } | null | undefined,
  lang: string
): string {
  if (!field) return ''
  return field[lang as keyof typeof field] || field.pl || ''
}