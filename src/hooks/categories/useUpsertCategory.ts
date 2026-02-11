import { useCallback, useState } from "react";
import { CategoryVisibility, DbCategory } from "../../firebase/type";
import { DbPaths } from "../../firebase/path";
import { dbPushKey, dbSet, dbUpdate } from "../../firebase/rtdb";


type Input = {
  houseId: string;
  categoryId?: string;
  name: string;
  type: CategoryVisibility;
  creatorId: string;
};

type Result =
  | { ok: true; categoryId: string }
  | { ok: false; error: string };

export function useUpsertCategory() {
  const [loading, setLoading] = useState(false);

  const upsertCategory = useCallback(async (input: Input): Promise<Result> => {
    const houseId = (input.houseId ?? "").trim();
    const categoryId = (input.categoryId ?? "").trim();
    const name = (input.name ?? "").trim();
    const creatorId = (input.creatorId ?? "").trim();
    const type = input.type;

    if (!houseId || !name || !creatorId || !type) return { ok: false, error: "INVALID_INPUT" };

    setLoading(true);
    try {
      if (!categoryId) {
        const newId = dbPushKey(DbPaths.categoriesByHouse(houseId));
        const model: DbCategory = { name, type, creatorId, totalByMonth: {} };
        await dbSet(DbPaths.category(houseId, newId), model);
        return { ok: true, categoryId: newId };
      }

      await dbUpdate(DbPaths.category(houseId, categoryId), { name, type, creatorId });
      return { ok: true, categoryId };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { upsertCategory, loading };
}
