import { supabase } from "./supabase"

export async function createAuditLog(
    requirementId: string,
    fieldName: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined
) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Only create log if values are different
        if (oldValue === newValue) return

        const { error } = await supabase
            .from("requirement_audit_logs")
            .insert([
                {
                    requirement_id: requirementId,
                    user_id: user.id,
                    field_name: fieldName,
                    old_value: oldValue?.toString() || null,
                    new_value: newValue?.toString() || null,
                },
            ])

        if (error) {
            console.error("Error creating audit log:", error)
        }
    } catch (error) {
        console.error("Error in createAuditLog:", error)
    }
}

export async function createMultipleAuditLogs(
    requirementId: string,
    changes: Record<string, { old: any; new: any }>
) {
    for (const [fieldName, { old: oldValue, new: newValue }] of Object.entries(changes)) {
        await createAuditLog(requirementId, fieldName, oldValue, newValue)
    }
}
