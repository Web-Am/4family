import { DbPaths } from "../firebase/path";
import { dbSet } from "../firebase/rtdb";
import { HouseRole } from "../firebase/type";


export async function addMemberToHouse(houseId: string, userId: string, role: HouseRole): Promise<void> {
  await dbSet(DbPaths.houseUserRole(houseId, userId), role);
}
