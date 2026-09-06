export const OPTION_STYLES = [
  { bg: "bg-quiz-1", ring: "ring-quiz-1", shape: "▲" },
  { bg: "bg-quiz-2", ring: "ring-quiz-2", shape: "◆" },
  { bg: "bg-quiz-3", ring: "ring-quiz-3", shape: "●" },
  { bg: "bg-quiz-4", ring: "ring-quiz-4", shape: "■" },
  { bg: "bg-quiz-5", ring: "ring-quiz-5", shape: "★" },
  { bg: "bg-quiz-6", ring: "ring-quiz-6", shape: "⬟" },
] as const;

export function optionStyle(index: number) {
  return OPTION_STYLES[index % OPTION_STYLES.length]!;
}

export function isTrueFalseQuestion(answers: { text: string }[]): boolean {
  if (answers.length !== 2) return false;
  const texts = answers.map(a => a.text.trim().toLowerCase());
  const hasTrueAndFalse = (texts.includes('true') && texts.includes('false'));
  return hasTrueAndFalse;
}

export function useCountdownLabel(
  endsAt: string | null | undefined,
  now: number,
) {
  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
}
