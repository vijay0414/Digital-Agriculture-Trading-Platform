import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("register-retailer", "routes/register-retailer.tsx"),
  route("products", "routes/events.tsx"),
  route("retailers/products", "routes/retailers/products.tsx"),
  route("retailers/orders", "routes/retailers/orders.tsx"),
  route("farmers/orders", "routes/farmers/orders.tsx"),
  route("notifications", "routes/notifications.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
