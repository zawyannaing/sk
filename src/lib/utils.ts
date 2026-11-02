export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

/**
 * Standard utility function for conditionally combining Tailwind and custom CSS class names.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === 'object') {
      for (const key of Object.keys(input)) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

export default cn;
