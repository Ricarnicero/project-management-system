"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Requirement, UserProfile } from "@/types"
import { supabase } from "@/lib/supabase"
import { Loader2, ExternalLink } from "lucide-react"
import { CreateRequirementDialog } from "@/components/requirements/CreateRequirementDialog"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

interface RequirementBoardProps {
    clientId: string
}

export function RequirementBoard({ clientId }: RequirementBoardProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Record<string, UserProfile>>({})

    const fetchRequirements = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("requirements")
                .select("*")
                .eq("client_id", clientId)
                .order("position", { ascending: true })

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
        fetchRequirements()
    }, [clientId])

    const todo = requirements.filter((r) => r.status === "pending")
    const inProgress = requirements.filter((r) => r.status === "in_progress")
    const completed = requirements.filter((r) => r.status === "completed")

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
            const newStatus = destination.droppableId as Requirement["status"]

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
                // Send notification if assigned
                if (draggedReq.assigned_to) {
                    const { error: notifError } = await supabase
                        .from("notifications")
                        .insert([
                            {
                                user_id: draggedReq.assigned_to,
                                title: "Estado de requerimiento actualizado",
                                message: `El requerimiento "${draggedReq.title}" ha cambiado a ${newStatus}`,
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
            const status = source.droppableId as Requirement["status"]
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
            // We only need to update the items that changed position, but for simplicity we can update the whole sublist
            // Or better, just update the ones in the sublist
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
                            <Droppable droppableId="pending">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        <h3 className="font-semibold text-lg flex items-center justify-between">
                                            Por Hacer
                                            <Badge variant="secondary">{todo.length}</Badge>
                                        </h3>
                                        {todo.map((req, index) => (
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
                                )}
                            </Droppable>

                            <Droppable droppableId="in_progress">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        <h3 className="font-semibold text-lg flex items-center justify-between">
                                            En Progreso
                                            <Badge variant="secondary">{inProgress.length}</Badge>
                                        </h3>
                                        {inProgress.map((req, index) => (
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
                                )}
                            </Droppable>

                            <Droppable droppableId="completed">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        <h3 className="font-semibold text-lg flex items-center justify-between">
                                            Completado
                                            <Badge variant="secondary">{completed.length}</Badge>
                                        </h3>
                                        {completed.map((req, index) => (
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
                                )}
                            </Droppable>
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
