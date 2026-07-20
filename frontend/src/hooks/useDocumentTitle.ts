import { useEffect } from "react";

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} — My Finance Tracker`;
  }, [title]);
}
