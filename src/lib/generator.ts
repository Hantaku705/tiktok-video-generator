import { SEGMENTS, VARIANTS, MAX_COMBINATIONS } from "@/types";

/**
 * Generate N unique random combinations
 * Each combination is an array of variant indices for each segment
 * e.g., [0, 2, 1, 4, 3, 0] means: seg0=A, seg1=C, seg2=B, seg3=E, seg4=D, seg5=A
 */
export function generateCombinations(
  n: number,
  segments: number = SEGMENTS,
  variants: number = VARIANTS
): number[][] {
  const maxCombinations = Math.pow(variants, segments);
  const requestedCount = Math.min(n, maxCombinations);

  const combinations: number[][] = [];
  const seen = new Set<string>();

  // For small n relative to max, use random sampling
  if (requestedCount < maxCombinations * 0.5) {
    while (combinations.length < requestedCount) {
      const combo = Array.from({ length: segments }, () =>
        Math.floor(Math.random() * variants)
      );
      const key = combo.join("-");
      if (!seen.has(key)) {
        seen.add(key);
        combinations.push(combo);
      }
    }
  } else {
    // For large n, generate all and shuffle/slice
    const allCombinations = generateAllCombinations(segments, variants);
    shuffleArray(allCombinations);
    return allCombinations.slice(0, requestedCount);
  }

  return combinations;
}

/**
 * Generate all possible combinations (use with caution for large values)
 */
function generateAllCombinations(
  segments: number,
  variants: number
): number[][] {
  const result: number[][] = [];

  function helper(current: number[]) {
    if (current.length === segments) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < variants; i++) {
      current.push(i);
      helper(current);
      current.pop();
    }
  }

  helper([]);
  return result;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Convert combination array to human-readable string
 * e.g., [0, 2, 1, 4, 3, 0] -> "A-C-B-E-D-A"
 */
export function combinationToString(combination: number[]): string {
  return combination.map((v) => String.fromCharCode(65 + v)).join("-");
}

/**
 * Convert combination array to filename-safe string
 * e.g., [0, 2, 1, 4, 3, 0] -> "ACBEDA"
 */
export function combinationToFilename(combination: number[]): string {
  return combination.map((v) => String.fromCharCode(65 + v)).join("");
}

/**
 * Validate that all required slots are filled
 */
export function validateGrid(
  grid: (File | null)[][],
  segments: number = SEGMENTS,
  variants: number = VARIANTS
): { valid: boolean; missing: Array<{ segment: number; variant: number }> } {
  const missing: Array<{ segment: number; variant: number }> = [];

  for (let seg = 0; seg < segments; seg++) {
    for (let v = 0; v < variants; v++) {
      if (!grid[seg]?.[v]) {
        missing.push({ segment: seg, variant: v });
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get statistics about possible combinations
 */
export function getStats(segments: number = SEGMENTS, variants: number = VARIANTS) {
  return {
    segments,
    variants,
    totalSlots: segments * variants,
    maxCombinations: MAX_COMBINATIONS,
    formula: `${variants}^${segments} = ${MAX_COMBINATIONS.toLocaleString()}`,
  };
}
