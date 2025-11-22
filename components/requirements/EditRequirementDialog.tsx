"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Requirement, UserProfile } from "@/types"
import { createMultipleAuditLogs } from "@/lib/auditLog"
import { RequirementDocuments } from "./RequirementDocuments"
import { AuditLogViewer } from "./AuditLogViewer"

interface EditRequirementDialogProps {
    requirement: Requirement
    open: boolean
    onOpenChange: (open: boolean) => void
    onRequirementUpdated: () => void
    defaultTab?: string
}

export function EditRequirementDialog({
    requirement,
    open,
    onOpenChange,
    onRequirementUpdated,
    defaultTab = "details"
}: EditRequirementDialogProps) {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<UserProfile[]>([])
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        area: "dev",
        assigned_to: "",
        dev_start_date: "",
        dev_end_date: "",
        internal_delivery_date: "",
        testing_start_date: "",
        testing_end_date: "",
        client_delivery_date: "",
    })

    useEffect(() => {
        if (open && requirement) {
            setFormData({
                title: requirement.title || "",
                description: requirement.description || "",
                status: requirement.status || "pending",
                priority: requirement.priority || "medium",
                area: requirement.area || "dev",
                assigned_to: requirement.assigned_to || "",
                dev_start_date: requirement.dev_start_date || "",
                dev_end_date: requirement.dev_end_date || "",
                internal_delivery_date: requirement.internal_delivery_date || "",
                testing_start_date: requirement.testing_start_date || "",
                testing_end_date: requirement.testing_end_date || "",
                client_delivery_date: requirement.client_delivery_date || "",
            })
            fetchUsers()
            setActiveTab(defaultTab)
        }
    }, [open, requirement, defaultTab])

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("full_name")

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Track changes for audit log
            const changes: Record<string, { old: any; new: any }> = {}

            Object.keys(formData).forEach((key) => {
                const oldValue = requirement[key as keyof Requirement]
                const newValue = formData[key as keyof typeof formData]
                if (oldValue !== newValue) {
                    changes[key] = { old: oldValue, new: newValue }
                }
            })

            // Update requirement
            const { error } = await supabase
                .from("requirements")
                .update({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    area: formData.area,
                    assigned_to: formData.assigned_to || null,
                    dev_start_date: formData.dev_start_date || null,
                    dev_end_date: formData.dev_end_date || null,
                    internal_delivery_date: formData.internal_delivery_date || null,
                    testing_start_date: formData.testing_start_date || null,
                    testing_end_date: formData.testing_end_date || null,
                    client_delivery_date: formData.client_delivery_date || null,
                })
                .eq("id", requirement.id)

            if (error) throw error

            // Create audit logs for changes
            await createMultipleAuditLogs(requirement.id, changes)

            onOpenChange(false)
            onRequirementUpdated()
        } catch (error) {
            console.error("Error updating requirement:", error)
            alert("Error al actualizar el requerimiento")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Requerimiento</DialogTitle>
                    <DialogDescription>
                        Actualiza los detalles del requerimiento
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Basic Information Section */}
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    {/* Status, Priority, Area - Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, status: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pendiente</SelectItem>
                                                    <SelectItem value="in_progress">En Progreso</SelectItem>
                                                    <SelectItem value="completed">Completado</SelectItem>
                                                    <SelectItem value="blocked">Bloqueado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Prioridad</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, priority: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Baja</SelectItem>
                                                    <SelectItem value="medium">Media</SelectItem>
                                                    <SelectItem value="high">Alta</SelectItem>
                                                    <SelectItem value="critical">Crítica</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="area">Área</Label>
                                            <Select
                                                value={formData.area}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, area: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dev">Desarrollo</SelectItem>
                                                    <SelectItem value="qa">QA</SelectItem>
                                                    <SelectItem value="support">Soporte</SelectItem>
                                                    <SelectItem value="admin">Administración</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Assigned To */}
                                    <div className="space-y-2">
                                        <Label htmlFor="assignedTo">Asignar a</Label>
                                        <Select
                                            value={formData.assigned_to}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, assigned_to: value === "none" ? "" : value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin asignar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin Asignar</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.full_name || user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Lifecycle Dates Section */}
                                <div className="border-t pt-4 space-y-4">
                                    <h3 className="text-sm font-semibold">Fechas del Ciclo de Vida</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dev_start_date">Inicio Desarrollo</Label>
                                            <Input
                                                id="dev_start_date"
                                                type="date"
                                                value={formData.dev_start_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, dev_start_date: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dev_end_date">Fin Desarrollo</Label>
                                            <Input
                                                id="dev_end_date"
                                                type="date"
                                                value={formData.dev_end_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, dev_end_date: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="internal_delivery_date">Entrega Interna</Label>
                                            <Input
                                                id="internal_delivery_date"
                                                type="date"
                                                value={formData.internal_delivery_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, internal_delivery_date: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="testing_start_date">Inicio Pruebas</Label>
                                            <Input
                                                id="testing_start_date"
                                                type="date"
                                                value={formData.testing_start_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, testing_start_date: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="testing_end_date">Fin Pruebas</Label>
                                            <Input
                                                id="testing_end_date"
                                                type="date"
                                                value={formData.testing_end_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, testing_end_date: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="client_delivery_date">Entrega Cliente</Label>
                                            <Input
                                                id="client_delivery_date"
                                                type="date"
                                                value={formData.client_delivery_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, client_delivery_date: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="documents">
                        <RequirementDocuments requirementId={requirement.id} />
                    </TabsContent>

                    <TabsContent value="history">
                        <AuditLogViewer requirementId={requirement.id} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
