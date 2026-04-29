type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>
  | ClassValue[];

/**
 * Tiny class-name joiner. Filters falsy values and accepts arrays / objects
 * so components can compose conditional Tailwind classes without pulling in
 * a runtime dependency.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
      continue;
    }

    if (typeof input === "object") {
      for (const key of Object.keys(input)) {
        if (input[key]) out.push(key);
      }
    }
  }

  return out.join(" ");
}
