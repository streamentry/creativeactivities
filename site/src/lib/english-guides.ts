/** Language codes from src/i18n/english-guides.txt: whitespace-separated, `#` starts a comment line. */
export function englishGuideLanguages(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .flatMap((line) => line.split(/\s+/))
    .filter(Boolean);
}
