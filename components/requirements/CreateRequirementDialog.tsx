"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2, Plus } from "lucide-react"
import { Client, Requirement } from "@/types"

interface CreateRequirementDialogProps {
    onRequirementCreated?: (requirement: Requirement) => void
    defaultClientId?: string
}

export function CreateRequirementDialog({
    onRequirementCreated,
    defaultClientId
}: CreateRequirementDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])

    const [formData, setFormData] = useState({
        title: "",
        clientId: defaultClientId || "",
    })

    useEffect(() => {
        if (open) {
            fetchClients()
        }
    }, [open])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: newRequirement, error } = await supabase.from("requirements").insert([
                {
                    client_id: formData.clientId,
                    title: formData.title,
                    status: "pending",
                    priority: "medium",
                    area: "dev",
                },
            ]).select().single()

            if (error) throw error
            if (!newRequirement) throw new Error("No se pudo crear el requerimiento")

            setOpen(false)
            setFormData({
                title: "",
                clientId: defaultClientId || "",
            })

            if (onRequirementCreated) {
                onRequirementCreated(newRequirement as Requirement)
            }

            // Redirect to the new requirement details page
            router.push(`/dashboard/requirements/${newRequirement.id}`)

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Requerimiento</DialogTitle>
                    <DialogDescription>
                        Ingresa el título del requerimiento para comenzar. Podrás agregar más detalles después.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Client Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="client">Cliente *</Label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, clientId: value })
                                }
                                disabled={!!defaultClientId}
                                required
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
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear y Editar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
