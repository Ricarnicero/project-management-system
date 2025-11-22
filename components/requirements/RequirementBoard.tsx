"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Requirement, UserProfile } from "@/types"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { CreateRequirementDialog } from "@/components/requirements/CreateRequirementDialog"
import { EditRequirementDialog } from "@/components/requirements/EditRequirementDialog"
import { DocumentUploadConfirmDialog } from "@/components/requirements/DocumentUploadConfirmDialog"
import { Button } from "@/components/ui/button"

interface RequirementBoardProps {
    projectId?: string
    clientId?: string
}

export function RequirementBoard({ projectId, clientId }: RequirementBoardProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Record<string, UserProfile>>({})
    const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null)
    const [defaultTab, setDefaultTab] = useState<string | undefined>(undefined)
    const [pendingRequirement, setPendingRequirement] = useState<Requirement | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const fetchRequirements = async () => {
        setLoading(true)
        try {
            let query = supabase.from("requirements").select("*")

            if (projectId) {
                query = query.eq("project_id", projectId)
            } else if (clientId) {
                query = query.eq("client_id", clientId)
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching requirements:", error)
            } else {
                setRequirements(data || [])
            }
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")

            if (error) {
                console.error("Error fetching users:", error)
            } else {
                const userMap: Record<string, UserProfile> = {}
                data?.forEach((user) => {
                    userMap[user.id] = user
                })
                setUsers(userMap)
            }
        } catch (error) {
            console.error("Error:", error)
        }
    }

    useEffect(() => {
        fetchUsers()
        if (projectId || clientId) {
            fetchRequirements()
        }
    }, [projectId, clientId])

    const todo = requirements.filter((r) => r.status === "pending")
    const inProgress = requirements.filter((r) => r.status === "in_progress")
    const completed = requirements.filter((r) => r.status === "completed")

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <CreateRequirementDialog
                    onRequirementCreated={(newRequirement) => {
                        fetchRequirements()
                        setPendingRequirement(newRequirement)
                        setShowConfirmDialog(true)
                    }}
                    defaultClientId={clientId}
                    defaultProjectId={projectId}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-3 flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : requirements.length === 0 ? (
                    <div className="col-span-3 text-center p-8 border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">No hay requerimientos registrados.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center justify-between">
                                Por Hacer
                                <Badge variant="secondary">{todo.length}</Badge>
                            </h3>
                            {todo.map((req) => (
                                <RequirementCard
                                    key={req.id}
                                    requirement={req}
                                    users={users}
                                    onEdit={(req) => {
                                        setEditingRequirement(req)
                                        setDefaultTab(undefined)
                                    }}
                                />
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center justify-between">
                                En Progreso
                                <Badge variant="secondary">{inProgress.length}</Badge>
                            </h3>
                            {inProgress.map((req) => (
                                <RequirementCard
                                    key={req.id}
                                    requirement={req}
                                    users={users}
                                    onEdit={(req) => {
                                        setEditingRequirement(req)
                                        setDefaultTab(undefined)
                                    }}
                                />
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center justify-between">
                                Completado
                                <Badge variant="secondary">{completed.length}</Badge>
                            </h3>
                            {completed.map((req) => (
                                <RequirementCard
                                    key={req.id}
                                    requirement={req}
                                    users={users}
                                    onEdit={(req) => {
                                        setEditingRequirement(req)
                                        setDefaultTab(undefined)
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {editingRequirement && (
                <EditRequirementDialog
                    requirement={editingRequirement}
                    open={!!editingRequirement}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setEditingRequirement(null)
                            setDefaultTab(undefined)
                            fetchRequirements()
                        }
                    }}
                    onRequirementUpdated={fetchRequirements}
                    defaultTab={defaultTab}
                />
            )}

            {pendingRequirement && (
                <DocumentUploadConfirmDialog
                    open={showConfirmDialog}
                    onOpenChange={(open) => {
                        setShowConfirmDialog(open)
                        if (!open) {
                            setPendingRequirement(null)
                        }
                    }}
                    onConfirm={() => {
                        setShowConfirmDialog(false)
                        setEditingRequirement(pendingRequirement)
                        setDefaultTab("documents")
                        setPendingRequirement(null)
                    }}
                    requirementTitle={pendingRequirement.title}
                />
            )}
        </div>
    )
}

function RequirementCard({
    requirement,
    users,
    onEdit
}: {
    requirement: Requirement
    users: Record<string, UserProfile>
    onEdit: (req: Requirement) => void
}) {
    const priorityColors = {
        low: "secondary",
        medium: "default",
        high: "destructive",
        critical: "destructive",
    } as const

    const assignee = requirement.assigned_to ? users[requirement.assigned_to] : null

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-medium leading-tight">{requirement.title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={priorityColors[requirement.priority] || "secondary"} className="shrink-0">
                            {requirement.priority}
                        </Badge>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => onEdit(requirement)}
                        >
                            Editar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{requirement.description}</p>
                <div className="flex gap-2 items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {requirement.area}
                    </Badge>
                    {assignee && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-medium">{assignee.full_name || assignee.email}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
