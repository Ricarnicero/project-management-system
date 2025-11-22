import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QAPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Área de QA</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Listo para Pruebas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Tickets movidos al estado de QA.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Reportes de Bugs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Bugs reportados recientemente.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
