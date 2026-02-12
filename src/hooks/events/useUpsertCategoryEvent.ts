import { useCallback, useState } from "react";
import { DbPaths } from "../../firebase/path";
import { dbPushKey, dbSet, dbGet, dbUpdate } from "../../firebase/rtdb";
import { HouseEvent, DbCategory } from "../../firebase/type";
import { yearFromTs, monthKeyFromTs, clamp0 } from "../../utils/month";


type Input = {
  houseId: string;
  categoryId: string;

  eventId?: string; // create if missing
  title: string;
  description?: string;
  amount: number;
  status: "complete" | "pending";
  creatorId: string;

  occurredAt?: number;
};

type Result =
  | { ok: true; eventId: string; year: number }
  | { ok: false; error: string };

export function useUpsertCategoryEvent() {
  const [loading, setLoading] = useState(false);

  const upsertEvent = useCallback(async (input: Input): Promise<Result> => {
    const houseId = (input.houseId ?? "").trim();
    const categoryId = (input.categoryId ?? "").trim();
    const eventId = (input.eventId ?? "").trim();
    const title = (input.title ?? "").trim();
    const description = (input.description ?? "").trim();
    const creatorId = (input.creatorId ?? "").trim();
    const amount = Number(input.amount);
    const status = input.status;

    if (!houseId || !categoryId || !title || !creatorId) return { ok: false, error: "INVALID_INPUT" };
    if (!Number.isFinite(amount)) return { ok: false, error: "INVALID_AMOUNT" };

    setLoading(true);
    try {
      const now = Date.now();
      const occurredAt = input.occurredAt ?? now;
      const year = yearFromTs(occurredAt);
      const monthKey = monthKeyFromTs(occurredAt);

      if (!eventId) {
        // CREATE
        const newId = dbPushKey(DbPaths.categoryEventsByYear(houseId, categoryId, year));

        const model: HouseEvent = {
          title,
          description: description || "",
          amount,
          status,
          creatorId,
          createdAt: now,
          updatedAt: now,
          occurredAt,
        };
console.log();
        await dbSet(DbPaths.categoryEvent(houseId, categoryId, year, newId), model);

        if (status === "complete") {
          const cat = await dbGet<DbCategory>(DbPaths.category(houseId, categoryId));
          const curr = Number(cat?.totalByMonth?.[monthKey] ?? 0);
          await dbUpdate(DbPaths.categoryTotals(houseId, categoryId), { [monthKey]: curr + amount });
        }

        return { ok: true, eventId: newId, year };
      }

      // UPDATE (stesso anno) – se vuoi spostare anno, fai delete+create
      const prev = await dbGet<HouseEvent>(DbPaths.categoryEvent(houseId, categoryId, year, eventId));
      if (!prev) return { ok: false, error: "EVENT_NOT_FOUND" };

      const prevTs = prev.occurredAt ?? prev.createdAt;
      const prevMonthKey = monthKeyFromTs(prevTs);

      const prevCounts = prev.status === "complete";
      const nextCounts = status === "complete";

      const cat = await dbGet<DbCategory>(DbPaths.category(houseId, categoryId));
      const currPrev = Number(cat?.totalByMonth?.[prevMonthKey] ?? 0);
      const currNext = Number(cat?.totalByMonth?.[monthKey] ?? 0);

      const patch: Record<string, number> = {};

      if (prevCounts) patch[prevMonthKey] = clamp0(currPrev - Number(prev.amount ?? 0));
      if (nextCounts) {
        const base = prevCounts && prevMonthKey === monthKey ? patch[prevMonthKey]! : currNext;
        patch[monthKey] = base + amount;
      }

      if (Object.keys(patch).length) {
        await dbUpdate(DbPaths.categoryTotals(houseId, categoryId), patch);
      }

      await dbUpdate(DbPaths.categoryEvent(houseId, categoryId, year, eventId), {
        title,
        description: description || "",
        amount,
        status,
        creatorId,
        updatedAt: now,
        occurredAt,
      });

      return { ok: true, eventId, year };
    } catch (err: any) {
      console.log(err)
      return { ok: false, error: String(err?.message ?? err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { upsertEvent, loading };
}
