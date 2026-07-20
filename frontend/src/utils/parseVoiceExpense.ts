import { ExpenseCategory } from "@/types/expense";

export interface ParsedVoiceExpense {
  amount: number | null;
  categoryId: number | null;
  description: string;
}

export function parseVoiceExpense(
  transcript: string,
  categories: ExpenseCategory[]
): ParsedVoiceExpense {
  const numberMatch = transcript.match(/(\d+(\.\d+)?)/);
  const amount = numberMatch ? parseFloat(numberMatch[1]) : null;

  const lower = transcript.toLowerCase();
  const matchedCategory = categories.find((c) => lower.includes(c.name.toLowerCase()));

  return {
    amount,
    categoryId: matchedCategory ? matchedCategory.id : null,
    description: transcript.replace(/^add\s+/i, "").trim(),
  };
}
