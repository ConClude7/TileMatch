export function getEnumkey<T extends Record<string, string>>(
  enumObj: T,
  value: string
): T[keyof T] | null {
  const key = Object.keys(enumObj).find((k) => enumObj[k] === value);
  return key ? (enumObj[key] as T[keyof T]) : null;
}
