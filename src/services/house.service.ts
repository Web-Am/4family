import { DbPaths } from "../firebase/path";
import { dbSet, dbUpdate } from "../firebase/rtdb";
import { DbHouse } from "../firebase/type";


export async function createHouse(houseId: string, house: DbHouse): Promise<void> {
  await dbSet(DbPaths.house(houseId), house);
}

export async function patchHouse(houseId: string, patch: Partial<DbHouse>): Promise<void> {
  await dbUpdate(DbPaths.house(houseId), patch as any);
}
