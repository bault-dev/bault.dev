import { AppSidebar } from "@/components/app/app-sidebar";
import { FilesHeader } from "@/components/files/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers"

export default async function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="h-svh overflow-hidden lg:p-3 lg:pl-0 w-full">
        <div className="lg:border lg:rounded-xl overflow-hidden flex flex-col items-center justify-start h-full w-full bg-background">
          <FilesHeader />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
