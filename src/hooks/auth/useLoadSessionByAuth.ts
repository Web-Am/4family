import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../../firebase/firebase";
import { DbPaths } from "../../firebase/path";
import { dbGet } from "../../firebase/rtdb";
import { AppUser, DbHouse } from "../../firebase/type";


type State =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "ready"; userId: string; user: AppUser; house: DbHouse }
  | { status: "error"; error: string };

export function useLoadSessionByAuth() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (authUser) => {
      try {
        if (!authUser) {
          setState({ status: "anon" });
          return;
        }

        const userId = authUser.uid;
        const user = await dbGet<AppUser>(DbPaths.user(userId));
        if (!user?.houseId) {
          setState({ status: "error", error: "USER_PROFILE_MISSING_OR_NO_HOUSE" });
          return;
        }

        const house = await dbGet<DbHouse>(DbPaths.house(user.houseId));
        if (!house) {
          setState({ status: "error", error: "HOUSE_NOT_FOUND" });
          return;
        }

        setState({ status: "ready", userId, user, house });
      } catch (err: any) {
        setState({ status: "error", error: String(err?.message ?? err) });
      }
    });

    return () => unsub();
  }, []);

  return { state };
}
