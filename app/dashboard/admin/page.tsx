import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Área de Administración</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Proyectos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Vista de alto nivel de todos los proyectos.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Asignación de Recursos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Asignaciones de miembros del equipo.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
