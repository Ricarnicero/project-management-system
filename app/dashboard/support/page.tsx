import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Área de Soporte</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets Abiertos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Tickets de soporte al cliente.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Escalamientos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Tickets escalados a Desarrollo/QA.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
