"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import * as React from "react"
import { useState } from "react"
import { CheckCircle, EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const initialNotifications = [
  {
    id: 1,
    title: "Nuevo archivo subido",
    description: "Se ha subido 'documento.pdf' a la carpeta Documentos.",
    time: "hace 2 min",
    read: false,
  },
  {
    id: 2,
    title: "Carpeta eliminada",
    description: "La carpeta 'Antiguos' ha sido eliminada.",
    time: "hace 10 min",
    read: false,
  },
  {
    id: 3,
    title: "Actualización disponible",
    description: "Hay una nueva versión de la app disponible.",
    time: "hace 1 h",
    read: true,
  },
]

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [showOnlyUnread, setShowOnlyUnread] = useState(true)

  const unreadCount = notifications.filter(n => !n.read).length
  const visibleNotifications = showOnlyUnread ? notifications.filter(n => !n.read) : notifications

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-border/40 font-semibold text-base flex items-center justify-between gap-2">
          <span>Notificaciones</span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={-1}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0" onClick={markAllAsRead} disabled={unreadCount === 0} tabIndex={-1}>
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Marcar todo como leído</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="h-7 items-center flex">
                    <Switch
                      checked={showOnlyUnread}
                      onCheckedChange={setShowOnlyUnread}
                      tabIndex={-1}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Mostrar solo no leídas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ul className="divide-y divide-border/40 max-h-64 overflow-y-auto">
          {visibleNotifications.map((n) => (
            <li
              key={n.id}
              className="p-4 hover:bg-muted/40 transition-colors flex items-start gap-3 cursor-pointer"
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center gap-2">
                  {n.title}
                  {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="No leída"></span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{n.description}</div>
                <div className="text-xs text-muted-foreground mt-1 text-right">{n.time}</div>
              </div>
            </li>
          ))}
        </ul>
        {visibleNotifications.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">No hay notificaciones {showOnlyUnread ? "no leídas" : ""}</div>
        )}
      </PopoverContent>
    </Popover>
  )
} 