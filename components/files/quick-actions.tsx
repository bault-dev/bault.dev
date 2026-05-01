"use client";

import {
	FileUp,
	FolderPlus,
	Link2,
	type LucideIcon,
	Upload,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getUploadUrl, saveFileToDatabase } from "@/app/actions/files-actions";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFilesStore } from "@/store/files-store";
import { FolderDialog } from "./folder-dialog";

type Action = {
	icon: LucideIcon;
	label: string;
	shortcut: string;
	handler: () => void;
};

export function QuickActions() {
	const params = useParams();
	const folderId = params.id as string | undefined;
	const [open, setOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { fetchFiles, fetchStorageStats } = useFilesStore();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Fast-path for single file for the button
		const file = files[0];
		const toastId = toast.loading(`Uploading ${file.name}...`);

		try {
			const { url, storageKey, fileId } = await getUploadUrl({
				name: file.name,
				type: file.type || "application/octet-stream",
				size: file.size,
			});

			const xhr = new XMLHttpRequest();
			await new Promise((resolve, reject) => {
				xhr.open("PUT", url, true);
				xhr.setRequestHeader(
					"Content-Type",
					file.type || "application/octet-stream",
				);
				xhr.onload = () => {
					if (xhr.status === 200) resolve(null);
					else reject(new Error("Upload failed"));
				};
				xhr.onerror = () => reject(new Error("Upload failed"));
				xhr.send(file);
			});

			await saveFileToDatabase({
				id: fileId,
				name: file.name,
				type: file.type || "application/octet-stream",
				size: file.size,
				storageKey,
				folderId,
			});

			await fetchFiles({ folderId });
			await fetchStorageStats();

			toast.success(`Uploaded ${file.name}`, { id: toastId });
		} catch (error) {
			console.error(error);
			toast.error(`Failed to upload ${file.name}`, { id: toastId });
		} finally {
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const actions: Action[] = [
		{
			icon: Upload,
			label: "Upload File",
			shortcut: "U",
			handler: () => {
				fileInputRef.current?.click();
			},
		},
		{
			icon: FolderPlus,
			label: "New Folder",
			shortcut: "N",
			handler: () => {
				setOpen(true);
			},
		},
		{ icon: Link2, label: "Share Link", shortcut: "L", handler: () => {} },
		{ icon: FileUp, label: "Import", shortcut: "I", handler: () => {} },
	];

	return (
		<TooltipProvider>
			<div className="flex items-center gap-1 p-0.5 rounded-xl border bg-card">
				{actions.map((action) => (
					<Tooltip key={action.label}>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" onClick={action.handler}>
								<action.icon className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="flex items-center gap-2">
							<span>{action.label}</span>
							<KbdGroup>
								<Kbd>⌘</Kbd>
								<Kbd>{action.shortcut}</Kbd>
							</KbdGroup>
						</TooltipContent>
					</Tooltip>
				))}
			</div>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileUpload}
			/>
			<FolderDialog
				parentId={params.id as string}
				open={open}
				onOpenChange={setOpen}
			/>
		</TooltipProvider>
	);
}
