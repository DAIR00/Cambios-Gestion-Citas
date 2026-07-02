import { supabase } from "../../lib/supabase";

export async function logAction({ userId, action, entityType, entityId, oldData, newData }) {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

    await supabase.from("audit_logs").insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        oid_data: oldData,
        new_data: newData,
        user_agent: userAgent,
    });
}
