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
    DialogTrigger,
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
import { supabase } from "@/lib/supabase"
import { Loader2, Plus } from "lucide-react"
import { Client, Project, UserProfile, Requirement } from "@/types"

interface CreateRequirementDialogProps {
    onRequirementCreated: (requirement: Requirement) => void
    defaultClientId?: string
    defaultProjectId?: string
}

export function CreateRequirementDialog({
    onRequirementCreated,
    defaultClientId,
    defaultProjectId
}: CreateRequirementDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [users, setUsers] = useState<UserProfile[]>([])

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        area: "dev",
        clientId: defaultClientId || "",
        projectId: defaultProjectId || "",
        assignedTo: "",
        dev_start_date: "",
        dev_end_date: "",
        internal_delivery_date: "",
        testing_start_date: "",
        testing_end_date: "",
        client_delivery_date: "",
    })

    useEffect(() => {
        if (open) {
            fetchClients()
            fetchUsers()
        }
    }, [open])

    useEffect(() => {
        if (formData.clientId) {
            fetchProjects(formData.clientId)
        } else {
            setProjects([])
        }
    }, [formData.clientId])

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .order("name")

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error("Error fetching clients:", error)
        }
    }

    const fetchProjects = async (clientId: string) => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("client_id", clientId)
                .order("name")

            if (error) throw error
            setProjects(data || [])
        } catch (error) {
            console.error("Error fetching projects:", error)
        }
    }

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
            const projectId = formData.projectId === "none" || !formData.projectId ? null : formData.projectId

            const { data: newRequirement, error } = await supabase.from("requirements").insert([
                {
                    client_id: formData.clientId || null,
                    project_id: projectId,
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    area: formData.area,
                    assigned_to: formData.assignedTo || null,
                    dev_start_date: formData.dev_start_date || null,
                    dev_end_date: formData.dev_end_date || null,
                    internal_delivery_date: formData.internal_delivery_date || null,
                    testing_start_date: formData.testing_start_date || null,
                    testing_end_date: formData.testing_end_date || null,
                    client_delivery_date: formData.client_delivery_date || null,
                },
            ]).select().single()

            if (error) throw error
            if (!newRequirement) throw new Error("No se pudo crear el requerimiento")

            // Create notification if assigned to someone
            if (formData.assignedTo) {
                const { data: { user } } = await supabase.auth.getUser()
                const assignerName = user?.email || "Alguien"

                await supabase.from("notifications").insert([
                    {
                        user_id: formData.assignedTo,
                        title: "Nuevo Requerimiento Asignado",
                        message: `${assignerName} te ha asignado el requerimiento: "${formData.title}"`,
                        link: null,
                    },
                ])
            }

            setOpen(false)
            setFormData({
                title: "",
                description: "",
                status: "pending",
                priority: "medium",
                area: "dev",
                clientId: defaultClientId || "",
                projectId: defaultProjectId || "",
                assignedTo: "",
                dev_start_date: "",
                dev_end_date: "",
                internal_delivery_date: "",
                testing_start_date: "",
                testing_end_date: "",
                client_delivery_date: "",
            })
            onRequirementCreated(newRequirement as Requirement)
        } catch (error) {
            console.error("Error creating requirement:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Requerimiento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Requerimiento</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles del requerimiento.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Client Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="client">Cliente</Label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, clientId: value, projectId: "" })
                                }
                                disabled={!!defaultClientId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="project">Proyecto (Opcional)</Label>
                            <Select
                                value={formData.projectId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, projectId: value })
                                }
                                disabled={!!defaultProjectId || !formData.clientId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={formData.clientId ? "Seleccionar proyecto" : "Selecciona un cliente primero"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin Proyecto</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assigned To */}
                        <div className="space-y-2">
                            <Label htmlFor="assignedTo">Asignar a (Opcional)</Label>
                            <Select
                                value={formData.assignedTo}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, assignedTo: value === "none" ? "" : value })
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

                        {/* Area, Priority, Status - Grid */}
                        <div className="grid grid-cols-3 gap-4">
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
                        </div>

                        {/* Lifecycle Dates Section */}
                        <div className="border-t pt-4 space-y-4">
                            <h3 className="text-sm font-semibold">Fechas del Ciclo de Vida (Opcional)</h3>

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
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
