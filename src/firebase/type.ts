export type HouseRole = "owner" | "member";

export type DbHouse = {
  name: string;
  ownerId: string;
  shareCode: string;
  users: Record<string, HouseRole>; // uid -> role
  createdAt?: number;
};

export type AppUserRole = "owner" | "member";

export type AppUser = {
  email: string;
  name: string;
  houseId: string;
  role: AppUserRole;
  createdAt: number;
};

export type CategoryVisibility = "public" | "private";

export type DbCategory = {
  name: string;
  type: CategoryVisibility;
  creatorId: string;
  totalByMonth?: Record<string, number>; // YYYY-MM -> number
};

export type HouseEventStatus = "complete" | "pending" | "deleted";

// ✅ rename: avoids DOM Event conflict
export type HouseEvent = {
  title: string;
  description?: string;
  amount: number;
  status: HouseEventStatus;
  creatorId: string;
  createdAt: number;
  updatedAt?: number;

  // for month totals
  occurredAt?: number;
};

export type DeletedHouseEvent = HouseEvent & {
  deletedAt: number;
};

export type WithId<T> = T & { id: string };
