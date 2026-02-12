import { useCallback, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../firebase/firebase";
import { DbPaths } from "../../firebase/path";
import { dbQueryByChildEquals, dbGet, dbUpdate } from "../../firebase/rtdb";
import { DbHouse, AppUser } from "../../firebase/type";
import { generateHouseCode } from "../../utils/house-code";


type Input = {
  email: string;
  password: string;
  houseName?: string;
  displayName?: string;
};

type Result =
  | { ok: true; userId: string; houseId: string; shareCode: string }
  | { ok: false; error: string };

async function generateUniqueShareCode(): Promise<string> {
  // best-effort: collision extremely rare
  for (let i = 0; i < 10; i++) {
    const code = generateHouseCode(5);
    const match = await dbQueryByChildEquals<DbHouse>(DbPaths.housesRoot(), "shareCode", code);
    if (!match || Object.keys(match).length === 0) return code;
  }
  return generateHouseCode(6);
}

export function useRegisterHouseAuth() {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (input: Input): Promise<Result> => {
    const email = (input.email ?? "").trim().toLowerCase();
    const password = input.password ?? "";
    const houseName = (input.houseName ?? "Casa").trim();
    const displayName = (input.displayName ?? "User").trim();

    if (!email || !password) return { ok: false, error: "INVALID_INPUT" };

    setLoading(true);
    try {
      // ✅ crea account Auth
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const userId = cred.user.uid;

      // safety: se già c'è un profilo, esci
      const existing = await dbGet<AppUser>(DbPaths.user(userId));
      if (existing?.houseId) return { ok: false, error: "USER_ALREADY_INITIALIZED" };

      const houseId = crypto.randomUUID();
      const shareCode = await generateUniqueShareCode();
      const now = Date.now();

      const house: DbHouse = {
        name: houseName,
        ownerId: userId,
        shareCode,
        users: {
          [userId]: "owner",
        },
        createdAt: now,
      };

      const user: AppUser = {
        email,
        name: displayName,
        houseId,
        role: "owner",
        createdAt: now,
      };

      // ✅ multi-location update atomico
      await dbUpdate("/", {
        [DbPaths.house(houseId)]: house,
        [DbPaths.user(userId)]: user,
        [DbPaths.emailToUserId(email)]: userId,
      });

      return { ok: true, userId, houseId, shareCode };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading };
}
