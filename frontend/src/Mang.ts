export function Mang<T>(arr1: T[], arr2: T[]): T[] {
  if (!arr1) return arr2 || [];
  if (!arr2) return arr1;
  return [...arr1, ...arr2];
}
