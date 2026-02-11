// RTDB keys cannot contain: '.', '#', '$', '[', ']', '/'.
export function encodeEmailKey(email: string): string {
   const e = (email ?? '').trim().toLowerCase();

  // blocca subito gli input invalidi
  if (!e || !e.includes('@')) return '';

  // RTDB non permette . # $ [ ]
  // soluzione stabile: replace puntuale
  return e
    .replace(/\./g, '_dot_')
    .replace(/@/g, '_at_')
    .replace(/#/g, '_hash_')
    .replace(/\$/g, '_dollar_')
    .replace(/\[/g, '_lbr_')
    .replace(/\]/g, '_rbr_');
}

export const DbPaths = {
  // roots
  housesRoot: () => `Houses`,
  usersRoot: () => `Users`,
  emailsRoot: () => `Emails`,
  categoriesRoot: () => `Categories`,
  eventsRoot: () => `Events`,
  deletedEventsRoot: () => `DeletedEvents`,

  // Houses
  house: (houseId: string) => `Houses/${houseId}`,
  houseUsers: (houseId: string) => `Houses/${houseId}/users`,
  houseUserRole: (houseId: string, userId: string) => `Houses/${houseId}/users/${userId}`,

  // Users
  user: (userId: string) => `Users/${userId}`,

  // Emails (email -> userId)
  emailToUserId: (email: string) => `Emails/${encodeEmailKey(email)}`,

  // Categories
  categoriesByHouse: (houseId: string) => `Categories/${houseId}`,
  category: (houseId: string, categoryId: string) => `Categories/${houseId}/${categoryId}`,
  categoryTotals: (houseId: string, categoryId: string) =>
    `Categories/${houseId}/${categoryId}/totalByMonth`,
  categoryTotalMonth: (houseId: string, categoryId: string, monthKey: string) =>
    `Categories/${houseId}/${categoryId}/totalByMonth/${monthKey}`,

  // Events
  categoryEventsByYear: (houseId: string, categoryId: string, year: number | string) =>
    `Events/${houseId}/${categoryId}/${String(year)}`,
  categoryEvent: (houseId: string, categoryId: string, year: number | string, eventId: string) =>
    `Events/${houseId}/${categoryId}/${String(year)}/${eventId}`,

  // Deleted events
  deletedCategoryEventsByYear: (houseId: string, categoryId: string, year: number | string) =>
    `DeletedEvents/${houseId}/${categoryId}/${String(year)}`,
  deletedCategoryEvent: (houseId: string, categoryId: string, year: number | string, eventId: string) =>
    `DeletedEvents/${houseId}/${categoryId}/${String(year)}/${eventId}`,
};
