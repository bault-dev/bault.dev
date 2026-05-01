import { create } from "zustand";

export type FileType =
	| "image"
	| "video"
	| "document"
	| "archive"
	| "audio"
	| "code"
	| "other";

export interface FileItem {
	id: string;
	name: string;
	type: FileType;
	size: string;
	sizeBytes: number;
	modifiedAt: string;
	createdAt: string;
	starred: boolean;
	shared: boolean;
	access: "owner" | "shared";
	folderId: string | null;
	owner?: { name: string | null; image: string | null } | null;
}

export interface Folder {
	id: string;
	name: string;
	color: string;
	filesCount: number;
	size: string;
	parentId: string | null;
}

interface FilesStore {
	files: FileItem[];
	folders: Folder[];
	storageStats: {
		used: number;
		total: number;
		breakdown: { type: string; size: number; color: string }[];
	};
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	toggleStarred: (fileId: string) => void;
	getFilteredFiles: () => FileItem[];
	getStarredFiles: () => FileItem[];
	getRecentFiles: () => FileItem[];
	getSharedFiles: () => FileItem[];
	getFilesByFolder: (folderId: string) => FileItem[];
	getFoldersByParent: (parentId: string | null) => Folder[];
	fetchFiles: (options?: {
		folderId?: string;
		sharedWithMe?: boolean;
	}) => Promise<void>;
	fetchFolders: (parentId?: string) => Promise<void>;
	fetchStorageStats: () => Promise<void>;
	createFolder: (
		name: string,
		parentId?: string,
		color?: string,
	) => Promise<void>;
	deleteFile: (fileId: string) => Promise<void>;
	renameFile: (fileId: string, newName: string) => Promise<void>;
	deleteFolder: (folderId: string) => Promise<void>;
	renameFolder: (folderId: string, newName: string) => Promise<void>;
}

import {
	createFolder,
	deleteFile as dbDeleteFile,
	deleteFolder as dbDeleteFolder,
	renameFile as dbRenameFile,
	renameFolder as dbRenameFolder,
	getStorageStats,
	listFiles,
	listFolders,
	listSharedFiles,
} from "@/app/actions/files-actions";

export const useFilesStore = create<FilesStore>((set, get) => ({
	files: [],
	folders: [],
	storageStats: { used: 0, total: 20, breakdown: [] },
	searchQuery: "",

	setSearchQuery: (query) => set({ searchQuery: query }),

	toggleStarred: (fileId) =>
		set((state) => ({
			files: state.files.map((file) =>
				file.id === fileId ? { ...file, starred: !file.starred } : file,
			),
		})),

	fetchFiles: async (options) => {
		try {
			const dbFiles = options?.sharedWithMe
				? await listSharedFiles()
				: await listFiles(options?.folderId);
			// Currently replacing all files when fetching. Depending on navigation strategy,
			// we might want to just hold the files of the current directory.
			set({ files: dbFiles });
		} catch (error) {
			console.error("Failed to fetch files:", error);
		}
	},

	fetchFolders: async (parentId) => {
		try {
			const dbFolders = await listFolders(parentId || null);
			set({ folders: dbFolders as Folder[] });
		} catch (error) {
			console.error("Failed to fetch folders:", error);
		}
	},

	fetchStorageStats: async () => {
		try {
			const stats = await getStorageStats();
			set({ storageStats: stats });
		} catch (error) {
			console.error("Failed to fetch storage stats:", error);
		}
	},

	createFolder: async (name, parentId, color) => {
		try {
			const result = await createFolder(name, parentId || null, color);
			if (result.success && result.folder) {
				const newFolder = {
					id: result.folder.id,
					name: result.folder.name,
					color: result.folder.color,
					filesCount: 0,
					size: "0 B",
					parentId: result.folder.parentId,
				};
				set((state) => ({
					folders: [...state.folders, newFolder],
				}));
			}
		} catch (error) {
			console.error("Failed to create folder:", error);
		}
	},

	deleteFile: async (fileId) => {
		try {
			const result = await dbDeleteFile(fileId);
			if (result.success) {
				set((state) => ({
					files: state.files.filter((f) => f.id !== fileId),
				}));
				get().fetchStorageStats();
			}
		} catch (error) {
			console.error("Failed to delete file:", error);
		}
	},

	renameFile: async (fileId, newName) => {
		try {
			const result = await dbRenameFile(fileId, newName);
			if (result.success) {
				set((state) => ({
					files: state.files.map((f) =>
						f.id === fileId ? { ...f, name: newName } : f,
					),
				}));
			}
		} catch (error) {
			console.error("Failed to rename file:", error);
		}
	},

	deleteFolder: async (folderId) => {
		try {
			const result = await dbDeleteFolder(folderId);
			if (result.success) {
				set((state) => ({
					folders: state.folders.filter((f) => f.id !== folderId),
				}));
			}
		} catch (error) {
			console.error("Failed to delete folder:", error);
		}
	},

	renameFolder: async (folderId, newName) => {
		try {
			const result = await dbRenameFolder(folderId, newName);
			if (result.success) {
				set((state) => ({
					folders: state.folders.map((f) =>
						f.id === folderId ? { ...f, name: newName } : f,
					),
				}));
			}
		} catch (error) {
			console.error("Failed to rename folder:", error);
		}
	},

	getFilteredFiles: () => {
		const { files, searchQuery } = get();
		let filtered = files;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((file) =>
				file.name.toLowerCase().includes(query),
			);
		}

		return filtered;
	},

	getStarredFiles: () => {
		const { files } = get();
		return files.filter((file) => file.starred);
	},

	getRecentFiles: () => {
		const { files } = get();
		return files.slice(0, 5);
	},

	getSharedFiles: () => {
		const { files } = get();
		return files.filter((file) => file.shared);
	},

	getFilesByFolder: (folderId: string) => {
		const { files } = get();
		return files.filter((file) => file.folderId === folderId);
	},

	getFoldersByParent: (parentId: string | null) => {
		const { folders } = get();
		return folders.filter((folder) => folder.parentId === parentId);
	},
}));
