import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/** Opens the create dialog when the page is reached via the Quick Actions FAB (?quickAdd=1). */
export function useQuickAdd(openCreate: () => void): void {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("quickAdd") === "1") {
      openCreate();
      searchParams.delete("quickAdd");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
