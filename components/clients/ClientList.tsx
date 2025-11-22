"use client"

import Link from "next/link"
import { Client } from "@/types"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Building2, Mail, Phone } from "lucide-react"

interface ClientListProps {
    clients: Client[]
}

export function ClientList({ clients }: ClientListProps) {
    if (clients.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No hay clientes registrados.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="block">
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                                    {client.name}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Registrado el {format(new Date(client.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {client.email && (
                                    <div className="flex items-center text-muted-foreground">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center text-muted-foreground">
                                        <Phone className="mr-2 h-4 w-4" />
                                        {client.phone}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
