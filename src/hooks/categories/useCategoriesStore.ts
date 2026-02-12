// categories.store.ts
import { create } from "zustand";
import { WithId } from "../../types/db";
import { DbCategory } from "../../firebase/type";
import { DbPaths } from "../../firebase/path";
import { dbSubscribeValue } from "../../firebase/rtdb";

type CategoriesStore = {
  houseId?: string;
  userId?: string;
  items: Array<WithId<DbCategory>>;
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  _unsub?: () => void;

  connect: (houseId: string, userId: string) => void;
  disconnect: () => void;
};

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  items: [],
  status: "idle",

  connect: (houseId, userId) => {
    const hid = houseId.trim();
    const uid = userId.trim();
    if (!hid || !uid) return;

    const cur = get();
    // ✅ se già connesso agli stessi parametri, non rifare nulla
    if (cur.houseId === hid && cur.userId === uid && cur._unsub) return;

    // chiudi eventuale vecchia sub
    cur._unsub?.();

    set({ houseId: hid, userId: uid, status: "loading", items: [] });

    const unsub = dbSubscribeValue<Record<string, DbCategory>>(
      DbPaths.categoriesByHouse(hid),
      (val) => {
        const raw = Object.entries(val ?? {}).map(([id, c]) => ({ id, ...c }));

        console.log("downloading")
        const itemsMine = raw
          .filter(x => x.type === "public" || (x.type === "private" && x.creatorId === uid))
          .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "it", { sensitivity: "base" }));

        set(prev => {
          // dedupe semplice per evitare rerender inutili
          const same =
            prev.items.length === itemsMine.length &&
            prev.items.every((p, i) => p.id === itemsMine[i].id);
          if (same && prev.status === "ready") return prev;

          return { ...prev, status: "ready", items: itemsMine };
        });
      }
    );

    set({ _unsub: unsub });
  },

  disconnect: () => {
    get()._unsub?.();
    set({ _unsub: undefined, houseId: undefined, userId: undefined, status: "idle", items: [] });
  },
}));
