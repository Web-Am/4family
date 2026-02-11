import { DbPaths } from "../firebase/path";
import { dbSet, dbUpdate } from "../firebase/rtdb";
import { AppUser } from "../firebase/type";

export async function createAppUser(userId: string, user: AppUser): Promise<void> {
  await dbSet(DbPaths.user(userId), user);
}

export async function patchAppUser(userId: string, patch: Partial<AppUser>): Promise<void> {
  await dbUpdate(DbPaths.user(userId), patch as any);
}
