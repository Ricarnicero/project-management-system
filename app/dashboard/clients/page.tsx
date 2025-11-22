"use client"

import { useEffect, useState } from "react"
import { ClientList } from "@/components/clients/ClientList"
import { CreateClientDialog } from "@/components/clients/CreateClientDialog"
import { supabase } from "@/lib/supabase"
import { Client } from "@/types"
import { Loader2 } from "lucide-react"

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)

    const fetchClients = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching clients:", error)
            } else {
                setClients(data || [])
            }
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                <CreateClientDialog onClientCreated={fetchClients} />
            </div>
            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <ClientList clients={clients} />
            )}
        </div>
    )
}
