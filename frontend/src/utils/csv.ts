/** Quote CSV fields and neutralize spreadsheet formulas in user-entered text. */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[\s]*[=+@\-\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
