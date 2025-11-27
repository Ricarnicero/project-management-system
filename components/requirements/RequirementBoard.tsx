"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Requirement, UserProfile, RequirementStatus } from "@/types"
import { supabase } from "@/lib/supabase"
import { Loader2, ExternalLink } from "lucide-react"
import { CreateRequirementDialog } from "@/components/requirements/CreateRequirementDialog"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { createAuditLog } from "@/lib/auditLog"

interface RequirementBoardProps {
    clientId: string
}

export function RequirementBoard({ clientId }: RequirementBoardProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [statuses, setStatuses] = useState<RequirementStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Record<string, UserProfile>>({})

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch statuses
            const { data: statusData, error: statusError } = await supabase
                .from("requirement_statuses")
                .select("*")
                .order("position", { ascending: true })

            if (statusError) console.error("Error fetching statuses:", statusError)

            // Fallback if no statuses found (e.g. table empty or error)
            const currentStatuses = statusData?.length ? statusData : [
                { id: "1", label: "Por Hacer", value: "pending", position: 0, is_default: true, color: "secondary" },
                { id: "2", label: "En Progreso", value: "in_progress", position: 1, is_default: true, color: "default" },
                { id: "3", label: "Completado", value: "completed", position: 2, is_default: true, color: "success" },
            ]
            setStatuses(currentStatuses)

            // Fetch requirements
            const { data: reqData, error: reqError } = await supabase
                .from("requirements")
                .select("*")
                .eq("client_id", clientId)
                .order("position", { ascending: true })

            if (reqError) {
                console.error("Error fetching requirements:", reqError)
            } else {
                setRequirements(reqData || [])
            }

            // Fetch users
            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("*")

            if (userError) {
                console.error("Error fetching users:", userError)
            } else {
                const userMap: Record<string, UserProfile> = {}
                userData?.forEach((user) => {
                    userMap[user.id] = user
                })
                setUsers(userMap)
            }
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [clientId])

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result

        if (!destination) return

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return
        }

        // Create a copy of requirements
        const newRequirements = [...requirements]
        const draggedReq = newRequirements.find((r) => r.id === draggableId)

        if (!draggedReq) return

        // If moving to a different list
        if (source.droppableId !== destination.droppableId) {
            const newStatus = destination.droppableId

            // Optimistic update
            const updatedReqs = newRequirements.map((r) =>
                r.id === draggableId ? { ...r, status: newStatus } : r
            )
            setRequirements(updatedReqs)

            // Backend update
            const { error } = await supabase
                .from("requirements")
                .update({ status: newStatus })
                .eq("id", draggableId)

            if (error) {
                console.error("Error updating status:", error)
                setRequirements(requirements)
            } else {
                // Log the change
                // Find status labels for logging
                const oldStatusLabel = statuses.find(s => s.value === draggedReq.status)?.label || draggedReq.status
                const newStatusLabel = statuses.find(s => s.value === newStatus)?.label || newStatus

                await createAuditLog(
                    draggedReq.id,
                    "status",
                    oldStatusLabel,
                    newStatusLabel
                )

                // Send notification if assigned
                if (draggedReq.assigned_to) {
                    const { error: notifError } = await supabase
                        .from("notifications")
                        .insert([
                            {
                                user_id: draggedReq.assigned_to,
                                title: "Estado de requerimiento actualizado",
                                message: `El requerimiento "${draggedReq.title}" ha cambiado a ${newStatusLabel}`,
                                link: `/dashboard/requirements/${draggedReq.id}`,
                            },
                        ])

                    if (notifError) {
                        console.error("Error sending notification:", notifError)
                    }
                }
            }
        } else {
            // Reordering in same list
            const status = source.droppableId
            const sublist = newRequirements.filter((r) => r.status === status)
            const [moved] = sublist.splice(source.index, 1)
            sublist.splice(destination.index, 0, moved)

            // Update positions locally
            const updatedSublist = sublist.map((r, index) => ({ ...r, position: index }))

            // Merge back
            const others = newRequirements.filter((r) => r.status !== status)
            const finalReqs = [...others, ...updatedSublist]
            setRequirements(finalReqs)

            // Persist positions
            for (const req of updatedSublist) {
                await supabase
                    .from("requirements")
                    .update({ position: req.position })
                    .eq("id", req.id)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <CreateRequirementDialog
                    onRequirementCreated={() => {
                        // No need to refresh here as we redirect to the new page
                    }}
                    defaultClientId={clientId}
                />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 items-start h-auto">
                    {loading ? (
                        <div className="w-full flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requirements.length === 0 && statuses.length === 0 ? (
                        <div className="w-full text-center p-8 border rounded-lg bg-muted/10">
                            <p className="text-muted-foreground">No hay requerimientos registrados.</p>
                        </div>
                    ) : (
                        <>
                            {statuses.map((status) => {
                                const statusReqs = requirements.filter(r => r.status === status.value)
                                return (
                                    <Droppable key={status.id} droppableId={status.value}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-4 min-w-[300px] w-[300px] flex-shrink-0 bg-muted/10 p-3 rounded-lg border"
                                            >
                                                <h3 className="font-semibold text-lg flex items-center justify-between mb-2">
                                                    {status.label}
                                                    <Badge variant={status.color as any || "secondary"}>{statusReqs.length}</Badge>
                                                </h3>
                                                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                                                    {statusReqs.map((req, index) => (
                                                        <Draggable key={req.id} draggableId={req.id} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <RequirementCard
                                                                        requirement={req}
                                                                        users={users}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                )
                            })}
                        </>
                    )}
                </div>
            </DragDropContext>
        </div>
    )
}

function RequirementCard({
    requirement,
    users,
}: {
    requirement: Requirement
    users: Record<string, UserProfile>
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
            <CardHeader className="p-2 pb-0">
                <div className="flex justify-between items-center gap-1">
                    <CardTitle className="text-xs font-medium leading-tight line-clamp-2">{requirement.title}</CardTitle>
                    <div className="flex items-center gap-1">
                        <Badge variant={priorityColors[requirement.priority] || "secondary"} className="shrink-0 text-[10px] px-1 py-0 h-4 min-w-[50px] justify-center">
                            {requirement.priority}
                        </Badge>
                        <Link href={`/dashboard/requirements/${requirement.id}`}>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-2"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-2 pt-1">
                <p className="text-[10px] text-muted-foreground mb-1 line-clamp-2">{requirement.description}</p>
                <div className="flex gap-2 items-center justify-between">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1 py-0 h-4">
                        {requirement.area}
                    </Badge>
                    {assignee && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="font-medium truncate max-w-[80px] text-right">{assignee.full_name || assignee.email}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
