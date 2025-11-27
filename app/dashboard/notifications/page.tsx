"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface Notification {
    id: string
    title: string
    message: string
    link: string | null
    read: boolean
    created_at: string
}

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const ITEMS_PER_PAGE = 20

    useEffect(() => {
        fetchNotifications()
    }, [page])

    const fetchNotifications = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get total count
        const { count } = await supabase
            .from("notifications")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id)

        if (count) {
            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
        }

        // Get data
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to)

        if (error) {
            console.error("Error fetching notifications:", error)
            toast.error("Error al cargar notificaciones")
        } else {
            setNotifications(data || [])
        }
        setLoading(false)
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id)

        if (error) {
            console.error("Error marking notification as read:", error)
            toast.error("Error al marcar como leída")
            return
        }

        // Update local state
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
        toast.success("Notificación marcada como leída")
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id)
        }
        if (notification.link) {
            router.push(notification.link)
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>

            {loading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No tienes notificaciones.
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notification.read ? "bg-muted/20 border-l-4 border-l-primary" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardContent className="p-4 flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <p className="text-muted-foreground mt-1">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(notification.created_at).toLocaleString("es-ES")}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            markAsRead(notification.id)
                                        }}
                                        title="Marcar como leída"
                                    >
                                        <Check className="h-5 w-5" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {page} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
