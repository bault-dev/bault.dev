import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/create-project-form";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  if (organizations && organizations.length > 0) {
    // User already has organizations, set the first one as active and redirect
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: organizations[0].id
      }
    });
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to bault.dev</h1>
          <p className="text-muted-foreground">
            To get started, please create your first specific project/workspace.
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
