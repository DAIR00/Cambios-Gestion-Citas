import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../mocks/supabase.mock";
import { logAction } from "./audit";

describe("logAction", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("inserta registro de auditoría con todos los campos", async () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    supabaseMock.from.mockReturnValue(chain);

    await logAction({
      userId: "admin-1",
      action: "CREATE_USER",
      entityType: "user",
      entityId: "user-1",
      oldData: null,
      newData: { full_name: "Test User" },
    });

    expect(supabaseMock.from).toHaveBeenCalledWith("audit_logs");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "admin-1",
      action: "CREATE_USER",
      entity_type: "user",
      entity_id: "user-1",
      oid_data: null,
      new_data: { full_name: "Test User" },
      user_agent: expect.any(String),
    });
  });

  it("captura el user_agent correctamente", async () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    supabaseMock.from.mockReturnValue(chain);

    await logAction({
      userId: "admin-1",
      action: "UPDATE_USER",
      entityType: "user",
      entityId: "user-1",
      oldData: { name: "Old" },
      newData: { name: "New" },
    });

    const insertArg = chain.insert.mock.calls[0][0];
    expect(insertArg.user_agent).toBeDefined();
  });

  it("maneja errores silenciosamente (no lanza)", async () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ error: { message: "insert failed" } }),
    };
    supabaseMock.from.mockReturnValue(chain);

    await expect(
      logAction({
        userId: "admin-1",
        action: "TEST",
        entityType: "test",
        entityId: "1",
      })
    ).resolves.not.toThrow();
  });

  it("funciona sin navigator (entorno Node)", async () => {
    const originalNavigator = global.navigator;
    delete global.navigator;

    const chain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    supabaseMock.from.mockReturnValue(chain);

    await logAction({
      userId: "admin-1",
      action: "TEST",
      entityType: "test",
      entityId: "1",
    });

    const insertArg = chain.insert.mock.calls[0][0];
    expect(insertArg.user_agent).toBeNull();

    global.navigator = originalNavigator;
  });
});
