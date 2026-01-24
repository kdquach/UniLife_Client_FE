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
 * Login with Google
 * @param {String} idToken - Google ID Token from Google OAuth
 * @returns {Promise<Object>} - { token, user }
 */
export async function loginWithGoogle(idToken) {
  const response = await api.post("/auth/google", { idToken });

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
 * Send OTP for registration
 * @param {Object} payload - { fullName, email, password, phone }
 * @returns {Promise<Object>} - { email }
 */
export async function sendRegisterOTP(payload) {
  const { fullName, email, password, phone } = payload;

  const response = await api.post("/auth/register/send-otp", {
    fullName,
    email,
    password,
    phone,
  });

  return {
    email: response.data.data?.email,
    message: response.data.message,
  };
}

/**
 * Verify OTP and complete registration
 * @param {Object} payload - { email, otp }
 * @returns {Promise<Object>} - { token, user }
 */
export async function verifyRegisterOTP(payload) {
  const { email, otp } = payload;

  const response = await api.post("/auth/register/verify-otp", { email, otp });

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
 * Send OTP for forgot password
 * @param {string} email - User email
 * @returns {Promise<Object>} - { email, message }
 */
export async function sendForgotPasswordOTP(email) {
  const response = await api.post("/auth/forgot-password", { email });

  return {
    email: response.data.data?.email,
    message: response.data.message,
  };
}

/**
 * Verify OTP for forgot password
 * @param {Object} payload - { email, otp }
 * @returns {Promise<Object>} - { resetToken, email }
 */
export async function verifyForgotPasswordOTP(payload) {
  const { email, otp } = payload;

  const response = await api.post("/auth/forgot-password/verify-otp", {
    email,
    otp,
  });

  return {
    resetToken: response.data.data?.resetToken,
    email: response.data.data?.email,
    message: response.data.message,
  };
}

/**
 * Reset password with token
 * @param {Object} payload - { email, resetToken, newPassword }
 * @returns {Promise<Object>} - { message }
 */
export async function resetPassword(payload) {
  const { email, resetToken, newPassword } = payload;

  const response = await api.post("/auth/reset-password", {
    email,
    resetToken,
    newPassword,
  });

  return {
    message: response.data.message,
  };
}

/**
 * Register new user (legacy - without OTP)
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
