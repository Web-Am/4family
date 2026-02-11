import { useEffect, useMemo, useState } from "react";
import { WithId } from "../../types/db";
import { DbPaths } from "../../firebase/path";
import { dbSubscribeValue } from "../../firebase/rtdb";
import { DbCategory } from "../../firebase/type";

type State =
  | { status: "idle"; items: Array<WithId<DbCategory>> }
  | { status: "loading"; items: Array<WithId<DbCategory>> }
  | { status: "ready"; items: Array<WithId<DbCategory>> }
  | { status: "error"; items: Array<WithId<DbCategory>>; error: string };

export function useCategories(houseId?: string) {
  const [state, setState] = useState<State>({ status: "idle", items: [] });

  useEffect(() => {
    const hid = (houseId ?? "").trim();
    if (!hid) {
      setState({ status: "idle", items: [] });
      return;
    }

    setState((s) => ({ ...s, status: "loading" }));

    const unsub = dbSubscribeValue<Record<string, DbCategory>>(DbPaths.categoriesByHouse(hid), (val) => {
      const items: Array<WithId<DbCategory>> = Object.entries(val ?? {}).map(([id, c]) => ({ id, ...c }));
      items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "it", { sensitivity: "base" }));
      setState({ status: "ready", items });
    });

    return () => unsub();
  }, [houseId]);

  const categories = useMemo(() => state.items, [state.items]);
  return { state, categories };
}
