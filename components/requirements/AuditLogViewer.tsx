"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { AuditLog, UserProfile } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2 } from "lucide-react"

interface AuditLogViewerProps {
    requirementId: string
}

export function AuditLogViewer({ requirementId }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [users, setUsers] = useState<Record<string, UserProfile>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
        fetchUsers()
    }, [requirementId])

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from("requirement_audit_logs")
                .select("*")
                .eq("requirement_id", requirementId)
                .order("changed_at", { ascending: false })

            if (error) throw error
            setLogs(data || [])
        } catch (error) {
            console.error("Error fetching audit logs:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")

            if (error) throw error

            const userMap: Record<string, UserProfile> = {}
            data?.forEach((user) => {
                userMap[user.id] = user
            })
            setUsers(userMap)
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    const getFieldLabel = (fieldName: string): string => {
        const labels: Record<string, string> = {
            title: "Título",
            description: "Descripción",
            status: "Estado",
            priority: "Prioridad",
            area: "Área",
            assigned_to: "Asignado a",
            dev_start_date: "Fecha inicio desarrollo",
            dev_end_date: "Fecha fin desarrollo",
            internal_delivery_date: "Fecha entrega interna",
            testing_start_date: "Fecha inicio pruebas",
            testing_end_date: "Fecha fin pruebas",
            client_delivery_date: "Fecha entrega cliente",
        }
        return labels[fieldName] || fieldName
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Cambios</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No hay cambios registrados
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {logs.map((log) => {
                        const user = users[log.user_id]
                        const userName = user?.full_name || user?.email || "Usuario desconocido"
                        const fieldLabel = getFieldLabel(log.field_name)

                        return (
                            <div
                                key={log.id}
                                className="border-l-2 border-primary pl-4 py-2"
                            >
                                <p className="text-sm">
                                    <span className="font-medium">{userName}</span> modificó{" "}
                                    <span className="font-medium">{fieldLabel}</span>
                                    {log.old_value && (
                                        <>
                                            {" "}de <span className="text-muted-foreground line-through">{log.old_value}</span>
                                        </>
                                    )}
                                    {log.new_value && (
                                        <>
                                            {" "}a <span className="font-medium text-primary">{log.new_value}</span>
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(log.changed_at), "PPpp", { locale: es })}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
