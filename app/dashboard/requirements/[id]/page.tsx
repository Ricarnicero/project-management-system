"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Requirement, UserProfile } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RequirementDocuments } from "@/components/requirements/RequirementDocuments"
import { AuditLogViewer } from "@/components/requirements/AuditLogViewer"

export default function RequirementDetailsPage() {
    const params = useParams()
    const id = params?.id as string
    const [requirement, setRequirement] = useState<Requirement | null>(null)
    const [loading, setLoading] = useState(true)
    const [assignee, setAssignee] = useState<UserProfile | null>(null)

    useEffect(() => {
        const fetchRequirement = async () => {
            if (!id) return

            try {
                const { data: reqData, error: reqError } = await supabase
                    .from("requirements")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (reqError) throw reqError
                setRequirement(reqData)

                if (reqData.assigned_to) {
                    const { data: userData, error: userError } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", reqData.assigned_to)
                        .single()

                    if (!userError) {
                        setAssignee(userData)
                    }
                }
            } catch (error) {
                console.error("Error fetching requirement:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRequirement()
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!requirement) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Requerimiento no encontrado</p>
                <Link href="/dashboard">
                    <Button variant="link">Volver al tablero</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Detalles del Requerimiento</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-1">Título</h3>
                            <p>{requirement.title}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Descripción</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {requirement.description}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <h3 className="font-semibold mb-1">Estado</h3>
                                <Badge>{requirement.status}</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Prioridad</h3>
                                <Badge variant="outline">{requirement.priority}</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Área</h3>
                                <Badge variant="secondary">{requirement.area}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Asignación y Fechas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-1">Asignado a</h3>
                            <p>{assignee ? assignee.full_name || assignee.email : "Sin asignar"}</p>
                        </div>
                        {/* Add dates here if needed */}
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <RequirementDocuments requirementId={id} />
                </div>

                <div className="md:col-span-2">
                    <AuditLogViewer requirementId={id} />
                </div>
            </div>
        </div>
    )
}
