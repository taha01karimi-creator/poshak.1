

const ADMIN_API_BASE = "/api/v1";

const ROLE_PERMISSIONS = {
  owner: [
    "products.read",
    "products.write",
    "products.delete",
    "orders.read",
    "orders.write",
    "orders.delete",
    "settings.read",
    "settings.write",
    "dashboard.read",
    "audit.read",
  ],
  admin: [
    "products.read",
    "products.write",
    "orders.read",
    "orders.write",
    "dashboard.read",
  ],
};
