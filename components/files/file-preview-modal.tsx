"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Loader2, Download, FileIcon, Eye, FileText, Copy, Check } from "lucide-react";
import { getCodePreview, getDownloadUrl } from "@/app/actions/files-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFileSize, formatDate, getFileType } from "@/lib/file-utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
  fileType: string;
}

export function FilePreviewModal({
  open,
  onOpenChange,
  fileId,
  fileName,
  fileType,
}: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ size?: number, modifiedAt?: Date | string | null }>({});
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  const fileCategory = getFileType(fileName, fileType || undefined);
  const isImage = fileCategory === "image";
  const isVideo = fileCategory === "video";
  const isTextOrCode = fileCategory === "code" || fileCategory === "text";

  useEffect(() => {
    if (!open) {
      setPreviewHtml(null);
      setImageUrl(null);
      setDownloadUrl(null);
      setError(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isTextOrCode) {
          const result = await getCodePreview(fileId);
          if (result.success && result.html) {
            setPreviewHtml(result.html);
            setRawText(result.raw || null);
            if (result.file) {
              setFileMeta({ size: result.file.size, modifiedAt: result.file.updatedAt || result.file.createdAt });
            }
            // Also fetch raw url for the download button
            if (result.file?.storageKey) {
              const urlRes = await getDownloadUrl(result.file.storageKey);
              if (urlRes.success && urlRes.url) setDownloadUrl(urlRes.url);
            }
          } else {
            setError(result.error || "Failed to load preview");
          }
        } else if (isImage || isVideo) {
          // Fallback to fetch raw presigned URL directly since we just need the `src`
          // We don't have the storageKey here directly in props, so we could theoretically
          // modify getDownloadUrl to take fileId, but `getCodePreview` does exactly what we need
          // without using Shiki if it fails. Let's just use getCodePreview because it returns the dbFile 
          // implicitly verifying auth.
          const result = await getCodePreview(fileId);
          if (result.file?.storageKey) {
            const urlRes = await getDownloadUrl(result.file.storageKey);
            if (urlRes.success && urlRes.url) {
              setImageUrl(urlRes.url);
              setDownloadUrl(urlRes.url);
            }
          } else {
            setError("Failed to load image securely.");
          }
        } else {
          // Unknown type, just get the download URL
          const result = await getCodePreview(fileId);
          if (result.file?.storageKey) {
            setFileMeta({ size: result.file.size, modifiedAt: result.file.updatedAt || result.file.createdAt });
            const urlRes = await getDownloadUrl(result.file.storageKey);
            if (urlRes.success && urlRes.url) {
              setDownloadUrl(urlRes.url);
            }
          }
        }
      } catch (e) {
        console.error(e);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [open, fileId, isTextOrCode, isImage, isVideo]);

  const handleCopy = async () => {
    if (rawText) {
      try {
        await navigator.clipboard.writeText(rawText);
        setCopied(true);
        toast.success("Copied", { description: "Content copied to clipboard." });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Error", { description: "Failed to copy content." });
      }
    }
  };

  const lineCount = rawText ? rawText.split("\n").length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl !w-[95vw] !h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-muted rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-muted/50 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate font-medium text-base">{fileName}</DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {fileMeta.size !== undefined && <span>{formatFileSize(fileMeta.size)}</span>}
                {fileMeta.size !== undefined && <span>•</span>}
                {fileMeta.modifiedAt && <span>{formatDate(fileMeta.modifiedAt)}</span>}
                {isTextOrCode && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0">
                      Code
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {downloadUrl && (
              <a href={downloadUrl} download={fileName} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg">
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[#17191E] flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-sm">Preparing secure preview...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-destructive gap-2 p-6 text-center">
              <p className="font-medium text-sm">{error}</p>
            </div>
          ) : isTextOrCode && previewHtml ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-3 pb-0 shrink-0 bg-background border-b border-border/10">
                <TabsList className="grid w-fit grid-cols-2 rounded-lg h-8 mb-2">
                  <TabsTrigger value="preview" className="rounded-md text-xs px-3 py-1">
                    <Eye className="mr-1.5 size-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="rounded-md text-xs px-3 py-1">
                    <FileText className="mr-1.5 size-3.5" />
                    Raw
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 mt-0 mx-0 overflow-hidden outline-none h-full">
                <ScrollArea className="h-full">
                  <div
                    className="p-4 sm:p-6 text-sm font-mono overflow-auto shiki-container w-full"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="raw" className="flex-1 mt-0 mx-0 overflow-hidden outline-none bg-background h-full">
                <ScrollArea className="h-full px-4">
                  <div className="rounded-lg bg-muted/10 border border-border/20 p-4 mx-0 my-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Raw Text</span>
                      <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-md h-7 px-2">
                        {copied ? <Check className="mr-1.5 size-3 text-green-500" /> : <Copy className="mr-1.5 size-3" />}
                        <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap break-all font-mono leading-relaxed text-muted-foreground">
                      {rawText}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : isImage && imageUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background h-full overflow-hidden relative">
              <img
                src={imageUrl}
                alt={fileName}
                className="max-w-full max-h-full rounded object-contain absolute inset-0 m-auto p-4"
              />
            </div>
          ) : isVideo && imageUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background h-full overflow-hidden relative">
              <video
                src={imageUrl}
                controls
                className="max-w-full max-h-full rounded absolute inset-0 m-auto p-4"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileIcon className="size-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                No preview available for this file type. You can download it to view its contents locally.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {isTextOrCode && !isLoading && !error && (
          <div className="flex items-center justify-between p-3 border-t border-border/10 bg-muted/5 text-xs text-muted-foreground shrink-0 h-11">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 bg-muted/20">
                {fileCategory.toUpperCase()}
              </Badge>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              {lineCount > 0 && <span>{lineCount} lines</span>}
              {fileMeta.size !== undefined && <span>{formatFileSize(fileMeta.size)}</span>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
