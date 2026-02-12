import { create } from "zustand";
import { WithId } from "../../types/db";
import { DbCategory, CategoryVisibility } from "../../firebase/type";
import { DbPaths } from "../../firebase/path";
import { dbSubscribeValue, dbPushKey, dbSet, dbUpdate } from "../../firebase/rtdb";

type CategoriesState = {
  houseId?: string;
  userId?: string;

  raw: Array<WithId<DbCategory>>;
  items: Array<WithId<DbCategory>>;

  status: "idle" | "loading" | "ready" | "error";
  error?: string;

  _unsub?: () => void;

  connect: (houseId: string, userId: string) => void;
  disconnect: () => void;

  upsertCategory: (input: {
    houseId: string;
    categoryId?: string;
    name: string;
    type: CategoryVisibility;
    creatorId: string;
  }) => Promise<{ ok: true; categoryId: string } | { ok: false; error: string }>;
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  raw: [],
  items: [],
  status: "idle",

  connect: (houseId, userId) => {
    const hid = houseId.trim();
    const uid = userId.trim();
    if (!hid || !uid) return;

    const current = get();

    // ✅ evita doppia subscribe
    if (current.houseId === hid && current.userId === uid && current._unsub) return;

    current._unsub?.();

    set({
      houseId: hid,
      userId: uid,
      status: "loading",
      raw: [],
      items: [],
    });

    const unsub = dbSubscribeValue<Record<string, DbCategory>>(
      DbPaths.categoriesByHouse(hid),
      (val) => {
        const raw = Object.entries(val ?? {}).map(([id, c]) => ({
          id,
          ...c,
        }));

        set((prev) => {
          const itemsMine = raw
            .filter(
              (x) =>
                x.type === "public" ||
                (x.type === "private" && x.creatorId === uid)
            )
            .sort((a, b) =>
              (a.name ?? "").localeCompare(b.name ?? "", "it", {
                sensitivity: "base",
              })
            );

          // dedupe minimale
          const same =
            prev.items.length === itemsMine.length &&
            prev.items.every((p, i) => p.id === itemsMine[i].id);

          if (same && prev.status === "ready") return prev;

          return {
            ...prev,
            raw,
            items: itemsMine,
            status: "ready",
          };
        });
      }
    );

    set({ _unsub: unsub });
  },

  disconnect: () => {
    get()._unsub?.();
    set({
      houseId: undefined,
      userId: undefined,
      raw: [],
      items: [],
      status: "idle",
      _unsub: undefined,
    });
  },

  upsertCategory: async (input) => {
    const houseId = (input.houseId ?? "").trim();
    const categoryId = (input.categoryId ?? "").trim();
    const name = (input.name ?? "").trim();
    const creatorId = (input.creatorId ?? "").trim();
    const type = input.type;

    if (!houseId || !name || !creatorId || !type)
      return { ok: false, error: "INVALID_INPUT" };

    try {
      if (!categoryId) {
        const newId = dbPushKey(DbPaths.categoriesByHouse(houseId));

        const model: DbCategory = {
          name,
          type,
          creatorId,
          totalByMonth: {},
        };

        await dbSet(DbPaths.category(houseId, newId), model);

        return { ok: true, categoryId: newId };
      }

      await dbUpdate(DbPaths.category(houseId, categoryId), {
        name,
        type,
        creatorId,
      });
      set(prev => ({
        ...prev,
        items: prev.items.map(c =>
          c.id === categoryId ? { ...c, name, type, creatorId } : c
        ),
      }));
      return { ok: true, categoryId };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  },
}));
