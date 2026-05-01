"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createShareLink } from "@/app/actions/files-actions";
import { PublicShareTab } from "./public-share-tab";
import { PrivateShareTab } from "./private-share-tab";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
}

export function ShareDialog({ open, onOpenChange, fileId, fileName }: ShareDialogProps) {
  const [shareData, setShareData] = useState<{ token: string; expiresAt: Date | null; hasPassword: boolean } | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchToken = async () => {
        setLoadingToken(true);
        try {
          // This will automatically create the public token if it doesn't exist yet, avoiding extra clicks.
          const res = await createShareLink(fileId);
          if (res.success && res.token) {
            setShareData({
              token: res.token,
              expiresAt: res.expiresAt ? new Date(res.expiresAt) : null,
              hasPassword: !!res.hasPassword
            });
          } else {
            toast.error("Failed to fetch share link");
            onOpenChange(false);
          }
        } catch {
          toast.error("Error creating share link");
          onOpenChange(false);
        } finally {
          setLoadingToken(false);
        }
      };
      fetchToken();
    } else {
      setShareData(null);
    }
  }, [open, fileId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] overflow-hidden p-6">
        <DialogHeader className="mb-2">
          <DialogTitle>Share "{fileName}"</DialogTitle>
          <DialogDescription>
            Manage public and private access to this file.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-2 outline-none">
            {loadingToken ? (
              <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="animate-spin size-6" /></div>
            ) : shareData ? (
              <PublicShareTab
                fileId={fileId}
                token={shareData.token}
                initialExpiresAt={shareData.expiresAt}
                initialHasPassword={shareData.hasPassword}
                onClose={() => onOpenChange(false)}
              />
            ) : null}
          </TabsContent>
          <TabsContent value="private" className="mt-2 outline-none">
            <PrivateShareTab fileId={fileId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
