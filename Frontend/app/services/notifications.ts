export interface AppNotification {
  id: number | string;
  userId: number | string; // Track who the notification belongs to
  title: string;
  message: string;
  type: "ORDER" | "SYSTEM" | "PAYMENT";
  seen: boolean;
  createdAt: string;
}

export async function getNotifications(userId?: number | string): Promise<AppNotification[]> {
  const mocks = JSON.parse(localStorage.getItem("mockNotifications") || "[]");
  
  // If we have no mocks yet, seeding with a welcome message
  if (mocks.length === 0) {
    const welcome: AppNotification = {
      id: "welcome-1",
      userId: userId || "any",
      title: "Welcome to SmartX AgriTrade!",
      message: "You are now logged in. Start trading fresh agricultural products today.",
      type: "SYSTEM",
      seen: false,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("mockNotifications", JSON.stringify([welcome]));
    return [welcome];
  }

  // Filter notifications for the current user
  return mocks.filter((n: any) => !userId || n.userId === userId || n.userId === "any");
}

export async function addNotification(
  userId: number | string,
  title: string,
  message: string,
  type: "ORDER" | "SYSTEM" | "PAYMENT" = "ORDER"
): Promise<void> {
  const mocks = JSON.parse(localStorage.getItem("mockNotifications") || "[]");
  const newN: AppNotification = {
    id: Date.now() + Math.random(),
    userId,
    title,
    message,
    type,
    seen: false,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem("mockNotifications", JSON.stringify([newN, ...mocks]));
}

export async function markAsRead(id: number | string): Promise<void> {
  const mocks = JSON.parse(localStorage.getItem("mockNotifications") || "[]");
  const updated = mocks.map((n: any) => n.id === id ? { ...n, seen: true } : n);
  localStorage.setItem("mockNotifications", JSON.stringify(updated));
}
