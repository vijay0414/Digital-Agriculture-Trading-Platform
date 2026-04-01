import api from "./api";

export interface ProductResponse {
  id: string | number;
  farmerId: number;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  availableQuantity: number;
  minOrderQty?: number;
  status: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResponse {
  content: ProductResponse[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface ProductParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  available?: boolean;
}

export interface CreateProductRequest {
  farmerId: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  unit?: string;
  availableQuantity: number;
  minOrderQty?: number;
  status?: string;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  unit?: string;
  availableQuantity?: number;
  minOrderQty?: number;
  status?: string;
}

export async function getProducts(
  params: ProductParams = {},
  signal?: AbortSignal
): Promise<PagedResponse> {
  const queryParams: Record<string, string> = {};
  if (params.page != null) queryParams.page = String(params.page);
  if (params.size != null) queryParams.size = String(params.size);
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.direction) queryParams.direction = params.direction;
  if (params.available) queryParams.available = "true";
  const { data } = await api.get<PagedResponse>("/api/products", {
    params: queryParams,
    signal,
  });
  return data;
}

export async function getFarmerProducts(farmerId: number): Promise<ProductResponse[]> {
  const { data } = await api.get<ProductResponse[]>("/farmers/me/products", {
    params: { farmerId },
  });
  return data;
}

export async function getRetailerProducts(): Promise<ProductResponse[]> {
  const { data } = await api.get<ProductResponse[]>("/retailers/products");
  return data;
}

export async function getRetailerProductsByCategory(category: string): Promise<ProductResponse[]> {
  const { data } = await api.get<ProductResponse[]>("/retailers/products/category", {
    params: { category },
  });
  return data;
}

export async function searchRetailerProducts(name: string): Promise<ProductResponse[]> {
  const { data } = await api.get<ProductResponse[]>("/retailers/products/search", {
    params: { name },
  });
  return data;
}

export async function createProduct(payload: CreateProductRequest): Promise<ProductResponse> {
  const { data } = await api.post<ProductResponse>("/farmers/me/products", payload);
  return data;
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductRequest
): Promise<ProductResponse> {
  const { data } = await api.put<ProductResponse>(`/farmers/me/products/${productId}`, payload);
  return data;
}

export async function deleteProduct(productId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/farmers/me/products/${productId}`);
  return data;
}
