import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeDecimal(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  // Handle Dates to ensure string serialization if needed
  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal);
  }

  // Check if it's a Prisma Decimal object or Decimal.js instance
  // Prisma decimals usually have d, e, s properties
  if (
    (obj.constructor && (obj.constructor.name === 'Decimal' || obj.constructor.name === 'Decimal2')) ||
    (obj.d && obj.e && obj.s) ||
    (typeof obj.toNumber === 'function')
  ) {
    return Number(obj.toString());
  }

  const serialized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      serialized[key] = serializeDecimal(obj[key]);
    }
  }
  return serialized;
}

