"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import {
  Archive,
  AudioLines,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  File,
  FileImage,
  FileText,
  ImageIcon,
  Loader2,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { getCodePreview, getDownloadUrl } from "@/app/actions/files-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDate,
  formatFileSize,
  getFileType,
  getLanguageFromFileName,
} from "@/lib/file-utils";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
  fileType: string;
}

type FileMeta = {
  size?: number;
  modifiedAt?: Date | string | null;
};

const categoryMeta = {
  archive: {
    icon: Archive,
    accent: "#10B981",
    bg: "#10B98115",
    label: "Archive",
  },
  audio: {
    icon: AudioLines,
    accent: "#06B6D4",
    bg: "#06B6D415",
    label: "Audio",
  },
  code: {
    icon: Code2,
    accent: "#6366F1",
    bg: "#6366F115",
    label: "Code",
  },
  image: {
    icon: FileImage,
    accent: "#8B5CF6",
    bg: "#8B5CF615",
    label: "Image",
  },
  text: {
    icon: FileText,
    accent: "#F59E0B",
    bg: "#F59E0B15",
    label: "Text",
  },
  unknown: {
    icon: File,
    accent: "#6B7280",
    bg: "#6B728015",
    label: "File",
  },
  video: {
    icon: Video,
    accent: "#EC4899",
    bg: "#EC489915",
    label: "Video",
  },
} as const;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="max-w-[60%] text-right text-sm text-foreground">{value}</div>
    </div>
  );
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
  const [fileMeta, setFileMeta] = useState<FileMeta>({});
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  const fileCategory = getFileType(fileName, fileType || undefined);
  const categoryConfig = categoryMeta[fileCategory] ?? categoryMeta.unknown;
  const CategoryIcon = categoryConfig.icon;
  const isImage = fileCategory === "image";
  const isVideo = fileCategory === "video";
  const isTextOrCode = fileCategory === "code" || fileCategory === "text";
  const lineCount = rawText ? rawText.split("\n").length : 0;
  const language = isTextOrCode ? getLanguageFromFileName(fileName) : null;

  useEffect(() => {
    if (!open) {
      setPreviewHtml(null);
      setRawText(null);
      setImageUrl(null);
      setDownloadUrl(null);
      setError(null);
      setFileMeta({});
      setActiveTab("preview");
      setCopied(false);
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
              setFileMeta({
                size: result.file.size,
                modifiedAt: result.file.updatedAt || result.file.createdAt,
              });
            }

            if (result.file?.storageKey) {
              const urlRes = await getDownloadUrl(result.file.storageKey);
              if (urlRes.success && urlRes.url) {
                setDownloadUrl(urlRes.url);
              }
            }
          } else {
            setError(result.error || "Failed to load preview");
          }
        } else {
          const result = await getCodePreview(fileId);

          if (result.file) {
            setFileMeta({
              size: result.file.size,
              modifiedAt: result.file.updatedAt || result.file.createdAt,
            });
          }

          if (result.file?.storageKey) {
            const urlRes = await getDownloadUrl(result.file.storageKey);
            if (urlRes.success && urlRes.url) {
              setDownloadUrl(urlRes.url);

              if (isImage || isVideo) {
                setImageUrl(urlRes.url);
              }
            } else {
              setError("Failed to prepare secure file access.");
            }
          } else {
            setError("Failed to load file information.");
          }
        }
      } catch (previewError) {
        console.error(previewError);
        setError("An unexpected error occurred while preparing the preview.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [fileId, isImage, isTextOrCode, isVideo, open]);

  const handleCopy = async () => {
    if (!rawText) return;

    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      toast.success("Copied", {
        description: "File contents copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Unable to copy the file contents.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[88vh] max-h-[920px] overflow-hidden p-0 sm:max-w-[min(1120px,96vw)]">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5">
          <div className="flex min-w-0 items-start gap-4 pr-10">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/60"
              style={{ backgroundColor: categoryConfig.bg }}
            >
              <CategoryIcon
                className="size-5"
                style={{ color: categoryConfig.accent }}
              />
            </div>

            <div className="min-w-0">
              <DialogTitle className="truncate text-lg">{fileName}</DialogTitle>
              <DialogDescription className="mt-1 max-w-2xl">
                Inspect the file preview, review key metadata, and download or copy
                the content when available.
              </DialogDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                  {categoryConfig.label}
                </Badge>
                {language && (
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                    {language}
                  </Badge>
                )}
                {fileMeta.size !== undefined && (
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                    {formatFileSize(fileMeta.size)}
                  </Badge>
                )}
                {fileMeta.modifiedAt && (
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                    Updated {formatDate(fileMeta.modifiedAt)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 bg-muted/10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 border-b px-4 py-4 lg:border-r lg:border-b-0 lg:px-5 lg:py-5">
            {isLoading ? (
              <Card className="h-full justify-center">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                  <p className="text-sm">Preparing secure preview...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="h-full justify-center">
                <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <File className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Preview unavailable</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : isTextOrCode && previewHtml ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full min-h-0 flex-col"
              >
                <Card className="min-h-0 flex-1">
                  <CardHeader className="border-b">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>
                          Rendered syntax preview and raw source for developer files.
                        </CardDescription>
                      </div>
                      <TabsList className="grid w-fit grid-cols-2 rounded-xl">
                        <TabsTrigger value="preview" className="gap-1.5 rounded-lg">
                          <Eye className="size-3.5" />
                          Preview
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="gap-1.5 rounded-lg">
                          <FileText className="size-3.5" />
                          Raw
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>

                  <CardContent className="min-h-0 flex-1 px-0">
                    <TabsContent value="preview" className="mt-0 h-full min-h-0 outline-none">
                      <ScrollArea className="h-full">
                        <div
                          className="shiki-container min-h-full p-4 text-sm font-mono sm:p-6"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0 h-full min-h-0 outline-none">
                      <ScrollArea className="h-full">
                        <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-muted-foreground sm:p-6">
                          <code>{rawText}</code>
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  </CardContent>

                  <CardFooter className="justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>UTF-8</span>
                      {lineCount > 0 && <span>{lineCount.toLocaleString()} lines</span>}
                    </div>
                    {isTextOrCode && rawText && (
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                        {copied ? "Copied" : "Copy source"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </Tabs>
            ) : isImage && imageUrl ? (
              <Card className="h-full">
                <CardHeader className="border-b">
                  <CardTitle>Image preview</CardTitle>
                  <CardDescription>
                    Secure in-app preview for image assets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 place-items-center p-4 sm:p-6">
                  <NextImage
                    src={imageUrl}
                    alt={fileName}
                    width={1600}
                    height={1200}
                    unoptimized
                    className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                  />
                </CardContent>
              </Card>
            ) : isVideo && imageUrl ? (
              <Card className="h-full">
                <CardHeader className="border-b">
                  <CardTitle>Video preview</CardTitle>
                  <CardDescription>
                    Stream the file directly in the modal when supported.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 place-items-center p-4 sm:p-6">
                  <video
                    src={imageUrl}
                    controls
                    className="max-h-full max-w-full rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                  >
                    <track kind="captions" label="No captions available" />
                  </video>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full justify-center">
                <CardContent className="flex flex-col items-center justify-center px-8 py-12 text-center">
                  <div
                    className="mb-5 flex size-16 items-center justify-center rounded-3xl border"
                    style={{ backgroundColor: categoryConfig.bg }}
                  >
                    <CategoryIcon
                      className="size-7"
                      style={{ color: categoryConfig.accent }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-medium">No embedded preview available</p>
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                      This file type does not currently support an in-app preview. You can
                      still download it or inspect its metadata from the side panel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="min-h-0 bg-background px-4 py-4 lg:px-5 lg:py-5">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>File details</CardTitle>
                    <CardDescription>
                      Quick metadata for this asset.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailRow
                      label="Type"
                      value={
                        <Badge variant="outline" className="rounded-full">
                          {categoryConfig.label}
                        </Badge>
                      }
                    />
                    {language && <DetailRow label="Language" value={language} />}
                    <DetailRow
                      label="Size"
                      value={
                        fileMeta.size !== undefined
                          ? formatFileSize(fileMeta.size)
                          : "Unknown"
                      }
                    />
                    <DetailRow
                      label="Updated"
                      value={
                        fileMeta.modifiedAt
                          ? formatDate(fileMeta.modifiedAt)
                          : "Unknown"
                      }
                    />
                    {isTextOrCode && (
                      <DetailRow
                        label="Lines"
                        value={lineCount > 0 ? lineCount.toLocaleString() : "Unknown"}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Preview mode</CardTitle>
                    <CardDescription>
                      Available viewing modes for this file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {isTextOrCode && (
                        <>
                          <Badge variant="secondary" className="rounded-full">
                            <Sparkles className="size-3.5" />
                            Syntax preview
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            <FileText className="size-3.5" />
                            Raw source
                          </Badge>
                        </>
                      )}
                      {isImage && (
                        <Badge variant="secondary" className="rounded-full">
                          <ImageIcon className="size-3.5" />
                          Image viewer
                        </Badge>
                      )}
                      {isVideo && (
                        <Badge variant="secondary" className="rounded-full">
                          <Play className="size-3.5" />
                          Video player
                        </Badge>
                      )}
                      {!isTextOrCode && !isImage && !isVideo && (
                        <Badge variant="secondary" className="rounded-full">
                          <File className="size-3.5" />
                          Metadata only
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>
                      Primary actions for this file preview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {downloadUrl && (
                      <a href={downloadUrl} download={fileName} target="_blank" rel="noreferrer">
                        <Button className="w-full justify-start gap-2">
                          <Download className="size-4" />
                          Download file
                        </Button>
                      </a>
                    )}
                    {isTextOrCode && rawText && (
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="w-full justify-start gap-2"
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {copied ? "Copied to clipboard" : "Copy file contents"}
                      </Button>
                    )}
                  </CardContent>
                  <CardFooter className="items-start">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Previews are generated through the current authenticated workspace
                      session and only expose files the active project can access.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
