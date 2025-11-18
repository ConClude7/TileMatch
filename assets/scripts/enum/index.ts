export function getEnumKey<T extends Record<string, number | string>>(
  enumObj: T,
  value: number | string
): string | null {
  const key = Object.keys(enumObj).find((k) => enumObj[k] === value);
  return key || null;
}
