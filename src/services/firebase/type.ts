
export type UserRole = "OWNER" | "PARTICIPANT";
export type MemberStatus = "PENDING" | "ACTIVE" | "REJECTED";
// All statuses used across the app. Use DELETED instead of CANCELLED per requirements
export type EventStatus = "PENDING" | "COMPLETED" | "DELETED" | "ARCHIVED";

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: number;
    houseId: string;
}

export interface House {
    id: string;
    code: string;
    name: string;
    ownerId: string;
    createdAt: number;
}

export interface HouseMember {
    userId: string;
    role: UserRole;
    status: MemberStatus;
    joinedAt?: number;
}

export interface Category {
    id: string;
    houseId: string;
    title: string;
    desc?: string;
    image?: string;
    createdBy: string;
    createdAt: number;
}

export interface EventItem {
    id: string;
    houseId: string;
    title: string;
    desc?: string;
    notes?: string;
    amount: number;
    status: EventStatus;
    categoryId: string;
    createdBy: string;
    createdAt: number;
    eventDate: number;
    year: number;
    receiptUrl?: string;
}

export interface Tag {
    id: string;
    houseId: string;
    title: string;
    desc?: string;
}