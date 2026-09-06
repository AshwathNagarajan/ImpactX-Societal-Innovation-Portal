const KEY = "impactx_user";
const memoryStore = new Map();

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key) || memoryStore.get(key) || null;
  } catch {
    return memoryStore.get(key) || null;
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
  memoryStore.delete(key);
}

export const credentials = {
  admin: { email: "admin@impactx.in", password: "admin123", name: "State Innovation Mission", role: "admin" },
  institute: { email: "institute@impactx.in", password: "institute123", name: "BIT Mesra Innovation Cell", role: "institute" },
  industry: { email: "industry@impactx.in", password: "industry123", name: "Tata Steel Foundation", role: "industry" }
};

export function login(email, password, role) {
  const user = credentials[role];
  if (user?.email === email && user.password === password) {
    safeSetItem(KEY, JSON.stringify({ email: user.email, name: user.name, role }));
    return { ok: true, user };
  }
  return { ok: false, error: "Invalid demo credentials for the selected role." };
}

export function saveUser(user) {
  const role = String(user.role || "").toLowerCase();
  safeSetItem(KEY, JSON.stringify({ email: user.email, name: user.name, role, id: user.id }));
}

export function getUser() {
  try { return JSON.parse(safeGetItem(KEY)); } catch { return null; }
}

export function logout() {
  safeRemoveItem(KEY);
  safeRemoveItem("impactx_access_token");
}

export function rolePath(role) {
  return role === "admin" ? "/admin" : role === "institute" ? "/institute" : "/industry";
}
