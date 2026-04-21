import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(price)
}

export function maskPhone(phone: string | null | undefined, fallback: string): string {
  if (!phone || phone.trim() === '') return fallback
  const cleaned = phone.replace(/[\s-]/g, '')
  if (cleaned.length < 7) return cleaned
  return `${cleaned.slice(0, 4)}***${cleaned.slice(-2)}`
}