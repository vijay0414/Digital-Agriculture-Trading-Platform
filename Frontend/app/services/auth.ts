import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  farmName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface RegisterRetailerRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  
  // Debug log: Inspect actual backend response structure
  console.log("Login Response from server:", response.data);
  
  return response.data;
}

export async function registerApi(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register/farmer", payload);
  return data;
}

export async function registerRetailerApi(payload: RegisterRetailerRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register/retailer", payload);
  return data;
}

export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/refresh", { refreshToken });
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/auth/users");
  return data;
}

export async function getFarmers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/auth/users/farmers");
  return data;
}

export async function getRetailers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/auth/users/retailers");
  return data;
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await api.get<User>(`/auth/users/${id}`);
  return data;
}
