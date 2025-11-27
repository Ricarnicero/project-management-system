"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { RequirementStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, GripVertical, Pencil, Check } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const AVAILABLE_COLORS = [
    { name: "default", value: "default", class: "bg-slate-500" },
    { name: "secondary", value: "secondary", class: "bg-gray-500" },
    { name: "primary", value: "primary", class: "bg-blue-500" },
    { name: "success", value: "success", class: "bg-green-500" },
    { name: "warning", value: "warning", class: "bg-yellow-500" },
    { name: "destructive", value: "destructive", class: "bg-red-500" },
]

export function StatusManager() {
    const [statuses, setStatuses] = useState<RequirementStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newStatusLabel, setNewStatusLabel] = useState("")
    const [newStatusColor, setNewStatusColor] = useState("default")
    const [editingStatus, setEditingStatus] = useState<RequirementStatus | null>(null)

    useEffect(() => {
        fetchStatuses()
    }, [])

    const fetchStatuses = async () => {
        try {
            const { data, error } = await supabase
                .from("requirement_statuses")
                .select("*")
                .order("position", { ascending: true })

            if (error) throw error
            setStatuses(data || [])
        } catch (error) {
            console.error("Error fetching statuses:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddStatus = async () => {
        if (!newStatusLabel.trim()) return

        const value = newStatusLabel.toLowerCase().replace(/\s+/g, "_")
        const position = statuses.length

        try {
            const { data, error } = await supabase
                .from("requirement_statuses")
                .insert([
                    {
                        label: newStatusLabel,
                        value,
                        position,
                        is_default: false,
                        color: newStatusColor,
                    },
                ])
                .select()
                .single()

            if (error) throw error

            setStatuses([...statuses, data])
            setNewStatusLabel("")
            setNewStatusColor("default")
            setIsAddDialogOpen(false)
            toast.success("Estado creado correctamente")
        } catch (error) {
            console.error("Error creating status:", error)
            toast.error("Error al crear el estado")
        }
    }

    const handleUpdateStatus = async () => {
        if (!editingStatus || !editingStatus.label.trim()) return

        try {
            const { error } = await supabase
                .from("requirement_statuses")
                .update({
                    label: editingStatus.label,
                    color: editingStatus.color
                })
                .eq("id", editingStatus.id)

            if (error) throw error

            setStatuses(
                statuses.map((s) => (s.id === editingStatus.id ? editingStatus : s))
            )
            setEditingStatus(null)
            toast.success("Estado actualizado correctamente")
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Error al actualizar el estado")
        }
    }

    const handleDeleteStatus = async (status: RequirementStatus) => {
        if (status.is_default) {
            toast.error("No se pueden eliminar los estados por defecto")
            return
        }

        if (!confirm(`¿Estás seguro de eliminar el estado "${status.label}"?`)) return

        try {
            // Check if there are requirements with this status
            const { count, error: countError } = await supabase
                .from("requirements")
                .select("*", { count: "exact", head: true })
                .eq("status", status.value)

            if (countError) throw countError

            if (count && count > 0) {
                toast.error(`Hay ${count} requerimientos en este estado. Muévelos antes de eliminar.`)
                return
            }

            const { error } = await supabase
                .from("requirement_statuses")
                .delete()
                .eq("id", status.id)

            if (error) throw error

            setStatuses(statuses.filter((s) => s.id !== status.id))
            toast.success("Estado eliminado correctamente")
        } catch (error) {
            console.error("Error deleting status:", error)
            toast.error("Error al eliminar el estado")
        }
    }

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(statuses)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        const updatedItems = items.map((item, index) => ({
            ...item,
            position: index,
        }))

        setStatuses(updatedItems)

        try {
            // Update positions in DB
            for (const item of updatedItems) {
                await supabase
                    .from("requirement_statuses")
                    .update({ position: item.position })
                    .eq("id", item.id)
            }
        } catch (error) {
            console.error("Error updating positions:", error)
            toast.error("Error al reordenar los estados")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Estados de Requerimientos</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Estado
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Estado</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    placeholder="Nombre del estado (ej. En Revisión)"
                                    value={newStatusLabel}
                                    onChange={(e) => setNewStatusLabel(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2">
                                    {AVAILABLE_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            className={cn(
                                                "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                color.class,
                                                newStatusColor === color.value
                                                    ? "border-foreground scale-110"
                                                    : "border-transparent hover:scale-105"
                                            )}
                                            onClick={() => setNewStatusColor(color.value)}
                                            title={color.name}
                                        >
                                            {newStatusColor === color.value && (
                                                <Check className="h-4 w-4 text-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleAddStatus}>Crear</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="statuses">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2"
                            >
                                {statuses.map((status, index) => (
                                    <Draggable
                                        key={status.id}
                                        draggableId={status.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="flex items-center justify-between p-3 bg-accent/50 rounded-md border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab text-muted-foreground hover:text-foreground"
                                                    >
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>
                                                    <div className={cn(
                                                        "h-3 w-3 rounded-full",
                                                        AVAILABLE_COLORS.find(c => c.value === status.color)?.class || "bg-slate-500"
                                                    )} />
                                                    <span className="font-medium">{status.label}</span>
                                                    {status.is_default && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                            Por defecto
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Dialog
                                                        open={editingStatus?.id === status.id}
                                                        onOpenChange={(open) =>
                                                            !open && setEditingStatus(null)
                                                        }
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingStatus(status)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Editar Estado</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Nombre</label>
                                                                    <Input
                                                                        value={editingStatus?.label || ""}
                                                                        onChange={(e) =>
                                                                            setEditingStatus(
                                                                                editingStatus
                                                                                    ? {
                                                                                        ...editingStatus,
                                                                                        label: e.target.value,
                                                                                    }
                                                                                    : null
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Color</label>
                                                                    <div className="flex gap-2">
                                                                        {AVAILABLE_COLORS.map((color) => (
                                                                            <button
                                                                                key={color.value}
                                                                                className={cn(
                                                                                    "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                                                    color.class,
                                                                                    editingStatus?.color === color.value
                                                                                        ? "border-foreground scale-110"
                                                                                        : "border-transparent hover:scale-105"
                                                                                )}
                                                                                onClick={() =>
                                                                                    setEditingStatus(
                                                                                        editingStatus
                                                                                            ? {
                                                                                                ...editingStatus,
                                                                                                color: color.value,
                                                                                            }
                                                                                            : null
                                                                                    )
                                                                                }
                                                                                title={color.name}
                                                                            >
                                                                                {editingStatus?.color === color.value && (
                                                                                    <Check className="h-4 w-4 text-white" />
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setEditingStatus(null)}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                                <Button onClick={handleUpdateStatus}>
                                                                    Guardar
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {!status.is_default && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteStatus(status)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </CardContent>
        </Card>
    )
}
