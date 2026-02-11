import { useEffect, useMemo, useState } from "react";
import { DbPaths } from "../../firebase/path";
import { dbSubscribeValue } from "../../firebase/rtdb";
import { WithId, HouseEvent } from "../../firebase/type";


type State =
  | { status: "idle"; items: Array<WithId<HouseEvent>> }
  | { status: "loading"; items: Array<WithId<HouseEvent>> }
  | { status: "ready"; items: Array<WithId<HouseEvent>> }
  | { status: "error"; items: Array<WithId<HouseEvent>>; error: string };

export function useCategoryEvents(params?: { houseId?: string; categoryId?: string; year?: number }) {
  const houseId = (params?.houseId ?? "").trim();
  const categoryId = (params?.categoryId ?? "").trim();
  const year = params?.year;

  const [state, setState] = useState<State>({ status: "idle", items: [] });

  useEffect(() => {
    if (!houseId || !categoryId || !year) {
      setState({ status: "idle", items: [] });
      return;
    }

    setState((s) => ({ ...s, status: "loading" }));

    const unsub = dbSubscribeValue<Record<string, HouseEvent>>(
      DbPaths.categoryEventsByYear(houseId, categoryId, year),
      (val) => {
        const items: Array<WithId<HouseEvent>> = Object.entries(val ?? {}).map(([id, e]) => ({ id, ...e }));
        items.sort((a, b) => {
          const ta = a.occurredAt ?? a.createdAt ?? 0;
          const tb = b.occurredAt ?? b.createdAt ?? 0;
          return tb - ta;
        });
        setState({ status: "ready", items });
      }
    );

    return () => unsub();
  }, [houseId, categoryId, year]);

  const events = useMemo(() => state.items, [state.items]);
  return { state, events };
}
