const USERS_KEY = "nirmiti_registered_users_v1";

export interface RegisteredUser {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

function loadUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: RegisteredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function listRegisteredUsers(): RegisteredUser[] {
  return loadUsers();
}

export function findRegisteredUser(loginId: string): RegisteredUser | undefined {
  const norm = loginId.trim().toLowerCase();
  return loadUsers().find(
    (u) => u.userId.toLowerCase() === norm || u.email.toLowerCase() === norm
  );
}

export function registerLocalUser(input: Omit<RegisteredUser, "createdAt">): RegisteredUser {
  const users = loadUsers();
  const normId = input.userId.trim().toLowerCase();
  const normEmail = input.email.trim().toLowerCase();
  if (users.some((u) => u.userId.toLowerCase() === normId)) {
    throw new Error("User ID already exists");
  }
  if (users.some((u) => u.email.toLowerCase() === normEmail)) {
    throw new Error("Email already registered");
  }
  const user: RegisteredUser = {
    ...input,
    userId: input.userId.trim(),
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
}

export function verifyRegisteredUser(loginId: string, password: string): RegisteredUser | null {
  const user = findRegisteredUser(loginId);
  if (!user || user.password !== password) return null;
  return user;
}

export function updateRegisteredUserProfile(
  userId: string,
  patch: Partial<Pick<RegisteredUser, "fullName" | "email" | "password">>
): RegisteredUser | null {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.userId === userId);
  if (idx < 0) return null;
  const next = { ...users[idx], ...patch };
  users[idx] = next;
  saveUsers(users);
  return next;
}