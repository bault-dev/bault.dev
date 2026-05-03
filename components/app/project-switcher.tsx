"use client"

import * as React from "react"
import { ChevronsUpDownIcon, PlusIcon, GalleryVerticalEndIcon, CheckIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"
import { CreateProjectForm } from "@/components/projects/create-project-form"

export function ProjectSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: organizations } = authClient.useListOrganizations()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const handleSwitchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({
      organizationId: orgId
    }, {
      onSuccess: () => {
        router.refresh()
      }
    })
  }

  // Helper to safely render icon
  const IconRenderer = ({ name, className }: { name?: string | null; className?: string }) => {
    if (!name) return <GalleryVerticalEndIcon className={className} />
    // @ts-ignore
    const Icon = LucideIcons[name + "Icon"] || LucideIcons[name] || GalleryVerticalEndIcon;
    return <Icon className={className} />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconRenderer name={activeOrg?.logo} className="size-4" />
              </div>
              <div
                data-sidebar="menu-text"
                className="grid flex-1 text-left text-sm leading-tight"
              >
                <span className="truncate font-medium">{activeOrg?.name || "Select Project"}</span>
                <span className="truncate text-xs">Active Workspace</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" data-sidebar="menu-trailing" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Projects
            </DropdownMenuLabel>
            {organizations?.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                className="gap-2 p-2 rounded-lg"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <IconRenderer name={org.logo} className="size-3.5 shrink-0" />
                </div>
                {org.name}
                {activeOrg?.id === org.id && <CheckIcon className="ml-auto size-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 rounded-lg" onClick={() => setIsCreateOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add project</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your files.
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  )
}
