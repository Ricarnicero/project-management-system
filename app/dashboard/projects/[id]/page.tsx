import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequirementBoard } from "@/components/requirements/RequirementBoard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Detalles del Proyecto</h1>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="requirements">Requerimientos</TabsTrigger>
                    <TabsTrigger value="docs">Documentación</TabsTrigger>
                    <TabsTrigger value="timeline">Cronograma</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen del Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>ID del Proyecto: {params.id}</p>
                            <p className="text-muted-foreground mt-2">
                                Este es un marcador de posición para el resumen del proyecto. Contendría estado, descripción, miembros del equipo, etc.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="requirements" className="space-y-4">
                    <RequirementBoard projectId={params.id} />
                </TabsContent>
                <TabsContent value="docs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Lista de documentos...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cronograma</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Vista de Gantt o línea de tiempo...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
