import { createUserWithEmailAndPassword } from "firebase/auth";
import { useCallback, useState } from "react";
import { firebaseAuth } from "../../firebase/firebase";
import { DbPaths } from "../../firebase/path";
import { dbQueryByChildEquals, dbGet, dbUpdate } from "../../firebase/rtdb";
import { DbHouse, AppUser } from "../../firebase/type";

type Input = {
  email: string;
  password: string;
  shareCode: string;
  displayName?: string;
};

type Result =
  | { ok: true; userId: string; houseId: string }
  | { ok: false; error: string };

export function useJoinHouseAuth() {
  const [loading, setLoading] = useState(false);

  const join = useCallback(async (input: Input): Promise<Result> => {
    const email = (input.email ?? "").trim().toLowerCase();
    const password = input.password ?? "";
    const shareCode = (input.shareCode ?? "").trim();
    const displayName = (input.displayName ?? "").trim();

    if (!email || !password || !shareCode) return { ok: false, error: "INVALID_INPUT" };

    setLoading(true);
    try {
      // ✅ trova casa per shareCode
      const found = await dbQueryByChildEquals<DbHouse>(DbPaths.housesRoot(), "shareCode", shareCode);
      const houseId = found ? Object.keys(found)[0] : null;
      if (!houseId) return { ok: false, error: "HOUSE_NOT_FOUND" };

      // ✅ crea account Auth
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const userId = cred.user.uid;

      const existing = await dbGet<AppUser>(DbPaths.user(userId));
      if (existing?.houseId) return { ok: false, error: "USER_ALREADY_INITIALIZED" };

      const now = Date.now();

      const user: AppUser = {
        email,
        name: displayName,
        houseId,
        role: "member",
        createdAt: now,
      };

      await dbUpdate("", {
        [DbPaths.user(userId)]: user,
        [DbPaths.houseUserRole(houseId, userId)]: "member",
        [DbPaths.emailToUserId(email)]: userId,
      });

      return { ok: true, userId, houseId };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { join, loading };
}
