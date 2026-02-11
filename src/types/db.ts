export type HouseUserRole = "owner" | "member";

export type House = {
  name: string;
  ownerId: string;
  shareCode: string;
  users: Record<string, HouseUserRole>; // userId -> role
};

export type UserRole = "owner" | "member";

export type User = {
  email: string;
  name: string;
  houseId: string;
  role: UserRole;
  createdAt: number;
};

export type CategoryType = "public" | "private";

export type Category = {
  name: string;
  type: CategoryType;
  creatorId: string;
  totalByMonth?: Record<string, number>; // "YYYY-MM" -> number
};

export type EventStatus = "complete" | "pending" | "deleted";

export type Event = {
  title: string;
  description?: string;
  amount: number;
  status: EventStatus;
  creatorId: string;
  createdAt: number;
  updatedAt?: number;

  // aggiunto per gestire totalByMonth in modo sensato
  occurredAt?: number;
};

export type DeletedEvent = Event & {
  deletedAt: number;
};

export type WithId<T> = T & { id: string };
