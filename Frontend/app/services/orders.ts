import api from "./api";

// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface OrderItemRequest {
  productId: number; // Strictly Long as per spec
  quantity: number;
}

export interface CreateOrderRequest {
  farmerId: number;
  items: OrderItemRequest[];
  notes?: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName?: string; // Optional field for human-readable display
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * Shape returned by POST /api/v1/retailers/me/orders (placeOrder)
 * Backend OrderResponse DTO only returns orderId, status, totalAmount.
 */
export interface PlaceOrderResponse {
  orderId: number;
  status: string;
  totalAmount: number;
}

/**
 * Shape returned by GET /api/v1/retailers/me/orders/retailer|farmer
 * and PATCH confirm/cancel — these return the full Order entity.
 */
export interface OrderResponse {
  id: number;
  retailerId: number;
  farmerId: number;
  status: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Place an order according to the manual specification.
 * POST /api/v1/retailers/me/orders?retailerId={retailerId}
 * Auth: None (Token will still be added by interceptor but might be ignored)
 */
export async function createOrder(
  retailerId: number,
  payload: CreateOrderRequest
): Promise<PlaceOrderResponse> {
  // Spec requirement: retailerId must be in query params
  const url = `/api/v1/retailers/me/orders?retailerId=${retailerId}`;
  
  const { data } = await api.post<PlaceOrderResponse>(url, payload);
  return data;
}

/**
 * Get all orders belonging to the authenticated retailer.
 * GET /api/v1/retailers/me/orders/retailer
 * retailerId is resolved server-side from the JWT — no query param needed.
 */
export async function getRetailerOrders(): Promise<OrderResponse[]> {
  const { data } = await api.get<OrderResponse[]>(
    "/api/v1/retailers/me/orders/retailer"
  );
  return data;
}

/**
 * Get all orders received by the authenticated farmer.
 * GET /api/v1/retailers/me/orders/farmer
 * farmerId is resolved server-side from the JWT.
 * Optionally pass a status filter.
 */
export async function getFarmerOrders(
  status?: string
): Promise<OrderResponse[]> {
  const { data } = await api.get<OrderResponse[]>(
    "/api/v1/retailers/me/orders/farmer",
    status ? { params: { status } } : undefined
  );
  return data;
}

/**
 * Confirm an order (FARMER only).
 * PATCH /api/v1/retailers/me/orders/{orderId}/confirm
 */
export async function confirmOrder(orderId: number): Promise<OrderResponse> {
  const { data } = await api.patch<OrderResponse>(
    `/api/v1/retailers/me/orders/${orderId}/confirm`
  );
  return data;
}

/**
 * Cancel an order (FARMER or RETAILER).
 * PATCH /api/v1/retailers/me/orders/{orderId}/cancel
 */
export async function cancelOrder(orderId: number): Promise<OrderResponse> {
  const { data } = await api.patch<OrderResponse>(
    `/api/v1/retailers/me/orders/${orderId}/cancel`
  );
  return data;
}
