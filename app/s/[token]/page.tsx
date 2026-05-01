import { getFileByShareToken, getDownloadUrl } from "@/app/actions/files-actions";
import { notFound } from "next/navigation";
import { codeToHtml } from "shiki";
import { Download, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileType, getLanguageFromFileName } from "@/lib/file-utils";

interface SharePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  // 1. Get file metadata & verify token validity
  const result = await getFileByShareToken(token);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileIcon className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Link Expired or Invalid</h1>
        <p className="text-muted-foreground">This shared file is no longer available.</p>
      </div>
    );
  }

  const file = result.data;

  // 2. Generate a fresh, temporary presigned URL to fetch the content securely
  const urlResult = await getDownloadUrl(file.storageKey);
  const downloadUrl = urlResult.success ? urlResult.url : null;

  if (!downloadUrl) {
    return notFound();
  }

  // Helper to determine what type of file we're sharing
  const fileCategory = getFileType(file.name, file.type || undefined);
  const isImage = fileCategory === "image";
  const isTextOrCode = fileCategory === "code" || fileCategory === "text";

  let codeHtml = "";
  let lang = "text";

  // 3. If it's code, fetch it Server-Side and use Shiki!
  if (isTextOrCode) {
    lang = getLanguageFromFileName(file.name);

    try {
      const response = await fetch(downloadUrl);
      const text = await response.text();

      // Syntax highlight via Shiki
      codeHtml = await codeToHtml(text, {
        lang: lang as any,
        theme: "houston", // One of shiki's cool dark themes
      });
    } catch (e) {
      console.error("Failed to fetch or parse code text serverside", e);
      codeHtml = `<pre><code>Error loading file content securely.</code></pre>`;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileIcon className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-medium text-sm sm:text-base truncate">{file.name}</h1>
            <p className="text-xs text-muted-foreground">Shared securely via Bault</p>
          </div>
        </div>

        <a href={downloadUrl} download={file.name} target="_blank" rel="noreferrer">
          <Button variant="default" size="sm" className="gap-2 shrink-0">
            <Download className="size-4" />
            <span className="hidden sm:inline">Download File</span>
          </Button>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-5xl">
          {isImage ? (
            <div className="rounded-xl border bg-card p-4 sm:p-8 flex items-center justify-center shadow-sm">
              <img
                src={downloadUrl}
                alt={file.name}
                className="max-w-full max-h-[80vh] rounded-md object-contain"
              />
            </div>
          ) : isTextOrCode ? (
            <div className="rounded-xl overflow-hidden border shadow-sm bg-[#17191E]">
              {/* Shiki automatically generates a <pre><code> block with styles inline */}
              <div
                className="p-4 sm:p-6 text-sm sm:text-base font-mono overflow-auto shiki-container"
                dangerouslySetInnerHTML={{ __html: codeHtml }}
              />
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-16 flex flex-col items-center justify-center shadow-sm text-center">
              <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <FileIcon className="size-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">Preview not available</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                This file type cannot be previewed directly in the browser. Please download it to view its contents.
              </p>
              <a href={downloadUrl} download={file.name} target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Download className="size-4" />
                  Download to View
                </Button>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
