import { api } from "@/services/axios.config";
import { setAccessToken, clearAccessToken } from "@/utils/storage";

const USER_KEY = "unilife_user";

/**
 * Login user
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export async function login(payload) {
  const { email, password } = payload;

  const response = await api.post("/auth/login", { email, password });

  const { token, data } = response.data;

  // Lưu token vào localStorage
  if (token) {
    setAccessToken(token);
  }

  // Lưu thông tin user vào localStorage
  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return {
    token,
    user: data?.user,
  };
}

/**
 * Register new user
 * @param {Object} payload - { fullName, email, password, phone }
 * @returns {Promise<Object>} - { token, user }
 */
export async function register(payload) {
  const { fullName, email, password, phone } = payload;

  const response = await api.post("/auth/register", {
    fullName,
    email,
    password,
    phone,
  });

  const { token, data } = response.data;

  // Lưu token vào localStorage
  if (token) {
    setAccessToken(token);
  }

  // Lưu thông tin user vào localStorage
  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return {
    token,
    user: data?.user,
  };
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Ignore error, still clear local data
    console.error("Logout API error:", error);
  } finally {
    clearAccessToken();
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem("unilife_access_token");
}
