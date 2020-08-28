/**
 * Guard against null and undefined
 * @param x
 */
export const isDefined = <T> (x: T | null | undefined): x is T => x !== undefined && x !== null

/**
 * Use default value if null or undefined
 * @param x
 * @param defaultValue
 */
export const defaultValue = <T> (x: T | null | undefined, defaultValue: T): T => isDefined(x) ? x : defaultValue

export const useOrFallback = <T, U> (x: T | null | undefined, dependent: (x: T) => U, defaultValue: U): U =>
  isDefined(x) ? dependent(x) : defaultValue

export const show = <T, U> (x: T | null | undefined, content: (x: T) => U): U | null => isDefined(x) ? content(x) : null
