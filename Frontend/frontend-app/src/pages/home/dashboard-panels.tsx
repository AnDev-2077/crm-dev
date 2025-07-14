import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Users, DollarSign, Activity, MessageSquare, Calendar, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function DashboardPanel() {
  const stats = [
    {
      title: "Ingresos Totales",
      value: "$45,231.89",
      change: "+20.1%",
      icon: DollarSign,
    },
    {
      title: "Usuarios Activos",
      value: "2,350",
      change: "+180.1%",
      icon: Users,
    },
    {
      title: "Ventas",
      value: "+12,234",
      change: "+19%",
      icon: BarChart3,
    },
    {
      title: "Actividad",
      value: "+573",
      change: "+201",
      icon: Activity,
    },
  ]

  const activities = [
    {
      user: "Ana García",
      action: "creó un nuevo proyecto",
      time: "hace 2 minutos",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      user: "Carlos López",
      action: "actualizó el dashboard",
      time: "hace 15 minutos",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      user: "María Rodríguez",
      action: "completó una tarea",
      time: "hace 1 hora",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      user: "Juan Pérez",
      action: "añadió un comentario",
      time: "hace 2 horas",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const projects = [
    {
      name: "Rediseño Web",
      progress: 75,
      status: "En progreso",
      team: 4,
      deadline: "15 Dic",
    },
    {
      name: "App Mobile",
      progress: 45,
      status: "En desarrollo",
      team: 6,
      deadline: "28 Dic",
    },
    {
      name: "Dashboard Analytics",
      progress: 90,
      status: "Casi completo",
      team: 3,
      deadline: "10 Dic",
    },
  ]

  const messages = [
    {
      from: "Equipo de Desarrollo",
      subject: "Actualización del sistema",
      preview: "Nueva versión disponible con mejoras...",
      time: "10:30 AM",
      unread: true,
    },
    {
      from: "Ana García",
      subject: "Revisión del proyecto",
      preview: "He revisado los cambios propuestos...",
      time: "9:15 AM",
      unread: true,
    },
    {
      from: "Soporte Técnico",
      subject: "Mantenimiento programado",
      preview: "El mantenimiento se realizará el...",
      time: "Ayer",
      unread: false,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
      </div>

      <Separator />

      {/* Panel de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proyectos + Actividad */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Proyectos Activos
              </CardTitle>
              <CardDescription>Estado actual de los proyectos en curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{project.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {project.team} miembros
                          <Calendar className="h-3 w-3 ml-2" />
                          {project.deadline}
                        </div>
                      </div>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progreso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>
                        {activity.user.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mensajes */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensajes
              <Badge variant="destructive" className="ml-auto">2</Badge>
            </CardTitle>
            <CardDescription>Mensajes y notificaciones recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg border ${message.unread ? "bg-muted/50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{message.from}</p>
                        {message.unread && <div className="h-2 w-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.subject}</p>
                      <p className="text-xs text-muted-foreground">{message.preview}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
