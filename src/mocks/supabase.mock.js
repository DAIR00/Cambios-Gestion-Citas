import { vi } from "vitest";

const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

const mockSignInWithPassword = vi.fn().mockResolvedValue({
  data: { user: { id: "user-1", email: "test@test.com" }, session: { access_token: "token" } },
  error: null,
});

const mockSignUp = vi.fn().mockResolvedValue({
  data: { user: { id: "user-1", email: "test@test.com" } },
  error: null,
});

const mockSignOut = vi.fn().mockResolvedValue({ error: null });

const mockResetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });

const mockUpdateUser = vi.fn().mockResolvedValue({ data: {}, error: null });

const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});

export const supabaseMock = {
  from: mockFrom,
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
    resetPasswordForEmail: mockResetPasswordForEmail,
    updateUser: mockUpdateUser,
    onAuthStateChange: mockOnAuthStateChange,
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
};

vi.mock("../lib/supabase", () => ({
  supabase: supabaseMock,
}));

export function resetMocks() {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  });
  mockSignInWithPassword.mockResolvedValue({
    data: { user: { id: "user-1", email: "test@test.com" }, session: { access_token: "token" } },
    error: null,
  });
  mockSignUp.mockResolvedValue({
    data: { user: { id: "user-1", email: "test@test.com" } },
    error: null,
  });
  mockSignOut.mockResolvedValue({ error: null });
  mockResetPasswordForEmail.mockResolvedValue({ error: null });
  mockUpdateUser.mockResolvedValue({ data: {}, error: null });
}

export { mockFrom, mockSignInWithPassword, mockSignUp, mockSignOut, mockResetPasswordForEmail, mockUpdateUser };
