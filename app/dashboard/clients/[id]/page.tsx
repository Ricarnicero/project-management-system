"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Client } from "@/types"
import { RequirementBoard } from "@/components/requirements/RequirementBoard"
import { Loader2, Building2, Mail, Phone } from "lucide-react"

export default function ClientDetailPage() {
    const params = useParams()
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const { data, error } = await supabase
                    .from("clients")
                    .select("*")
                    .eq("id", params.id)
                    .single()

                if (error) throw error
                setClient(data)
            } catch (error) {
                console.error("Error fetching client:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchClient()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!client) {
        return <div>Cliente no encontrado</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    {client.name}
                </h1>
                <div className="flex gap-4 mt-2 text-muted-foreground">
                    {client.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {client.email}
                        </div>
                    )}
                    {client.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                        </div>
                    )}
                </div>
            </div>

            <div className="">
                <h2 className="text-xl font-semibold">Requerimientos</h2>
                <RequirementBoard clientId={client.id} />
            </div>
        </div>
    )
}
