
import { ref, push, set, update, get } from "firebase/database";
import { db } from "./firebase";
import { Category, EventItem, House, User } from "./type";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// ---------- USERS ----------

export const createUser = async (user: User) => {
    await set(ref(db, `users/${user.id}`), user);
};

export const getUser = async (userId: string) => {
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.val();
};

// ---------- HOUSES ----------

export const createHouse = async (house: House) => {
    await set(ref(db, `houses/${house.id}`), house);
};

export const getHouse = async (houseId: string) => {
    const snapshot = await get(ref(db, `houses/${houseId}`));
    return snapshot.val();
};

// ---------- MEMBERS ----------

export const addMemberToHouse = async (
    houseId: string,
    userId: string,
    data: any
) => {
    await set(ref(db, `houseMembers/${houseId}/${userId}`), data);
};

// ---------- CATEGORIES ----------

export const createCategory = async (category: Category) => {
    const categoryRef = push(ref(db, `categories/${category.houseId}`));
    await set(categoryRef, {
        ...category,
        id: categoryRef.key,
    });
};

export const getCategories = async (houseId: string) => {
    const snapshot = await get(ref(db, `categories/${houseId}`));
    return snapshot.val();
};

// ---------- EVENTS ----------

export const createEvent = async (event: EventItem) => {
    const eventRef = push(ref(db, `events/${event.houseId}`));

    await set(eventRef, {
        ...event,
        id: eventRef.key,
    });
};

export const updateEvent = async (
    houseId: string,
    eventId: string,
    data: Partial<EventItem>
) => {
    await update(ref(db, `events/${houseId}/${eventId}`), data);
};

export const getEventsByYear = async (houseId: string, year: number) => {
    const snapshot = await get(ref(db, `events/${houseId}`));
    const data = snapshot.val();

    if (!data) return [];

    return Object.values(data).filter((e: any) => e.year === year);
};

export const getEventsByCategory = async (
    houseId: string,
    categoryId: string
) => {
    const snapshot = await get(ref(db, `events/${houseId}`));
    const data = snapshot.val();

    if (!data) return [];

    return Object.values(data).filter((e: any) => e.categoryId === categoryId);
};

// ---------- RECEIPTS STORAGE ----------


export const uploadReceipt = async (file: File, houseId: string) => {
    const fileRef = storageRef(storage, `receipts/${houseId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
};
