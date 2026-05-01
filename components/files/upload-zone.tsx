"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { getUploadUrl, saveFileToDatabase } from "@/app/actions/files-actions";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFilesStore } from "@/store/files-store";

export function UploadZone({
	children,
	folderId,
}: {
	children: React.ReactNode;
	folderId?: string;
}) {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const { fetchFiles, fetchStorageStats } = useFilesStore();

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return;

			setUploading(true);
			setProgress(0);

			// Upload one by one for now to keep it simple
			// In production, you might want parallel uploads
			for (const file of acceptedFiles) {
				try {
					// 1. Get Presigned URL
					const { url, storageKey, fileId } = await getUploadUrl({
						name: file.name,
						type: file.type,
						size: file.size,
					});

					// 2. Upload to R2 directly
					const xhr = new XMLHttpRequest();

					await new Promise((resolve, reject) => {
						xhr.upload.addEventListener("progress", (event) => {
							if (event.lengthComputable) {
								const percentComplete = (event.loaded / event.total) * 100;
								setProgress(percentComplete);
							}
						});

						xhr.open("PUT", url, true);
						xhr.setRequestHeader("Content-Type", file.type);

						xhr.onload = () => {
							if (xhr.status === 200) {
								resolve(null);
							} else {
								reject(new Error("Upload failed"));
							}
						};

						xhr.onerror = () => reject(new Error("Upload failed"));
						xhr.send(file);
					});

					// 3. Save metadata to DB
					await saveFileToDatabase({
						id: fileId,
						name: file.name,
						type: file.type,
						size: file.size,
						storageKey: storageKey,
						folderId: folderId,
					});

					// 4. Update UI stores
					await fetchFiles({ folderId });
					await fetchStorageStats();

					toast.success(`Uploaded ${file.name}`);
				} catch (error) {
					console.error(error);
					toast.error(`Failed to upload ${file.name}`);
				}
			}

			setUploading(false);
			setProgress(0);
		},
		[folderId, fetchFiles, fetchStorageStats],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		noClick: true, // We might want a button for click
		noKeyboard: true,
	});

	return (
		<div
			{...getRootProps()}
			className={cn(
				"relative flex-1 h-auto min-h-0 w-full transition-colors flex flex-col",
				isDragActive && "bg-accent/20",
			)}
		>
			<input {...getInputProps()} />

			{children}

			{/* Overlay when dragging */}
			{isDragActive && (
				<div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-2 text-primary">
						<UploadCloud className="h-10 w-10 animate-bounce" />
						<p className="font-medium">Drop files to upload</p>
					</div>
				</div>
			)}

			{/* Uploading State Overlay */}
			{uploading && (
				<div className="absolute bottom-4 right-4 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">Uploading...</span>
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					</div>
					<Progress value={progress} className="h-2" />
				</div>
			)}

			{/* 
        This component is meant to wrap the main content area.
        The children will be rendered by the consumer (page.tsx).
        The dropzone logic wraps everything.
      */}
		</div>
	);
}
