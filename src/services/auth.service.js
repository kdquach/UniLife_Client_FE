import { setAccessToken } from "@/utils/storage";

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function login(payload) {
  // Mock login (offline-first)
  await wait(350);

  const email = String(payload?.email || "").trim();
  const accessToken = email ? "mock-access-token" : "";
  if (accessToken) setAccessToken(accessToken);

  return {
    accessToken,
    user: {
      id: "mock-user",
      email: email || "user@mock.local",
      name: "Unilife User",
    },
  };
}

export async function register(payload) {
  // Mock register
  await wait(450);
  return {
    id: `mock-${Date.now()}`,
    email: String(payload?.email || "user@mock.local").trim(),
    createdAt: new Date().toISOString(),
  };
}
