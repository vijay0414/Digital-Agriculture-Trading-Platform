import api from "./api";

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  status: string;
  maxVolunteers: number;
  currentVolunteers: number;
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
}

export async function getEvents(upcoming?: boolean, signal?: AbortSignal): Promise<EventResponse[]> {
  const params = upcoming !== undefined ? { upcoming } : {};
  const { data } = await api.get<EventResponse[]>("/api/events", { params, signal });
  return data;
}
