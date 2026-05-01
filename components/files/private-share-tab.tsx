"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MoreHorizontal, UserX, Mail } from "lucide-react";
import { toast } from "sonner";
import { shareFileInternally, getInternalCollaborators, revokeInternalAccess } from "@/app/actions/files-actions";

interface Collaborator {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
}

export function PrivateShareTab({ fileId }: { fileId: string }) {
  const [emailsRaw, setEmailsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const fetchCollaborators = useCallback(async () => {
    try {
      const users = await getInternalCollaborators(fileId);
      setCollaborators(users as Collaborator[]);
    } catch {
      // silent
    }
  }, [fileId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleInvite = async () => {
    if (!emailsRaw.trim()) return;
    setLoading(true);
    try {
      const emailsList = emailsRaw.split(/[, ]+/).filter(Boolean);
      const res = await shareFileInternally(fileId, emailsList);

      if (res.success) {
        if (res.added && res.added > 0) {
          toast.success(`Access granted to ${res.added} users.`);
        }
        if (res.alreadyInvited && res.alreadyInvited.length > 0) {
          toast.info(`${res.alreadyInvited.length} user(s) were already invited: ${res.alreadyInvited.join(", ")}`);
        }
        if (res.failedEmails && res.failedEmails.length > 0) {
          toast.error(`${res.failedEmails.length} emails do not have an account: ${res.failedEmails.join(", ")}`);
        }
        if (res.selfInvite) {
          toast.warning("You cannot invite yourself.");
        }
        setEmailsRaw("");
        await fetchCollaborators();
      } else {
        toast.error(res.error || "Failed to share.");
      }
    } catch {
      toast.error("Error inviting users");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      const res = await revokeInternalAccess(fileId, userId);
      if (res.success) {
        toast.success("Access revoked");
        await fetchCollaborators();
      } else {
        toast.error(res.error || "Failed to revoke access");
      }
    } catch {
      toast.error("Error revoking access");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="invite-email" className="text-xs uppercase tracking-wider text-muted-foreground">
            Invite by Email
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="invite-email"
              placeholder="email1@domain.com, email2@domain.com..."
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInvite();
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={handleInvite} disabled={loading || !emailsRaw.trim()} variant="secondary" className="px-4">
                {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
                Invite
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>Separate multiple emails by comma or space</FieldDescription>
        </Field>
      </FieldGroup>

      <Separator />

      <FieldGroup>
        <Field>
          <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Added Teammates
          </FieldLabel>

          <div className="flex flex-col gap-4 min-h-[100px] max-h-[300px] overflow-y-auto pr-2">
            {collaborators.length === 0 ? (
              <Empty className="py-2 min-h-24">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Mail /></EmptyMedia>
                  <EmptyTitle className="text-xs">No teammates added yet.</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              collaborators.map((c) => (
                <div key={c.userId} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={c.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase font-medium">
                        {c.name ? c.name.charAt(0) : c.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">{c.name || "User"}</span>
                      <span className="text-xs text-muted-foreground tracking-tight">{c.email}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => handleRevoke(c.userId)}
                        >
                          <UserX data-icon="inline-start" />
                          Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </Field>
      </FieldGroup>
    </div>
  );
}
