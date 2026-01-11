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

  // Check if it's a Prisma Decimal object (Decimal, Decimal2, etc) or any Decimal.js instance
  // We check for 'd', 's', 'e' properties which are common in Decimal.js implementations
  if (
    (obj.constructor && (obj.constructor.name === 'Decimal' || obj.constructor.name === 'Decimal2')) ||
    (typeof obj.toNumber === 'function' && obj.d !== undefined && obj.s !== undefined)
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

