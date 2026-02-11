import { useCallback, useState } from "react";
import { DbPaths } from "../../firebase/path";
import { dbGet, dbSet, dbRemove, dbUpdate } from "../../firebase/rtdb";
import { HouseEvent, DeletedHouseEvent, DbCategory } from "../../firebase/type";
import { monthKeyFromTs, clamp0 } from "../../utils/month";


type Input = {
  houseId: string;
  categoryId: string;
  year: number;
  eventId: string;
};

type Result =
  | { ok: true }
  | { ok: false; error: string };

export function useDeleteCategoryEvent() {
  const [loading, setLoading] = useState(false);

  const deleteEvent = useCallback(async (input: Input): Promise<Result> => {
    const houseId = (input.houseId ?? "").trim();
    const categoryId = (input.categoryId ?? "").trim();
    const year = Number(input.year);
    const eventId = (input.eventId ?? "").trim();

    if (!houseId || !categoryId || !eventId || !Number.isFinite(year)) return { ok: false, error: "INVALID_INPUT" };

    setLoading(true);
    try {
      const ev = await dbGet<HouseEvent>(DbPaths.categoryEvent(houseId, categoryId, year, eventId));
      if (!ev) return { ok: false, error: "EVENT_NOT_FOUND" };

      const deletedAt = Date.now();
      const deleted: DeletedHouseEvent = { ...ev, status: "deleted", deletedAt };

      await dbSet(DbPaths.deletedCategoryEvent(houseId, categoryId, year, eventId), deleted);
      await dbRemove(DbPaths.categoryEvent(houseId, categoryId, year, eventId));

      if (ev.status === "complete") {
        const ts = ev.occurredAt ?? ev.createdAt;
        const monthKey = monthKeyFromTs(ts);
        const cat = await dbGet<DbCategory>(DbPaths.category(houseId, categoryId));
        const curr = Number(cat?.totalByMonth?.[monthKey] ?? 0);
        await dbUpdate(DbPaths.categoryTotals(houseId, categoryId), { [monthKey]: clamp0(curr - Number(ev.amount ?? 0)) });
      }

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteEvent, loading };
}
