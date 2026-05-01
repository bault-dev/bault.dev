"use server";

import { randomUUID, scryptSync } from "node:crypto";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, count, desc, eq, inArray, isNull, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { codeToHtml } from "shiki";
import { db } from "@/db";
import {
	fileCollaborators,
	fileShares,
	files,
	folders,
	user,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { fileCategories, getCategoryForFile } from "@/lib/file-categories";
import { getLanguageFromFileName } from "@/lib/file-utils";

const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

interface GetUploadUrlParams {
	name: string;
	type: string;
	size: number;
}

export async function getUploadUrl({ name, type, size }: GetUploadUrlParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		throw new Error("Unauthorized: No active organization");
	}

	const organizationId = session.session.activeOrganizationId;
	const fileId = randomUUID();
	const extension = name.split(".").pop();
	const storageKey = `projects/${organizationId}/${fileId}.${extension}`;

	const signedUrl = await getSignedUrl(
		r2,
		new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: storageKey,
			ContentType: type,
			ContentLength: size,
		}),
		{ expiresIn: 600 }, // 10 minutes
	);

	return { url: signedUrl, storageKey, fileId };
}

interface SaveFileParams {
	id: string; // The UUID we generated on the server
	name: string;
	type: string;
	size: number;
	storageKey: string;
	folderId?: string | null;
}

export async function saveFileToDatabase(fileData: SaveFileParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		throw new Error("Unauthorized");
	}

	await db.insert(files).values({
		id: fileData.id,
		name: fileData.name,
		type: fileData.type,
		size: fileData.size,
		storageKey: fileData.storageKey,
		organizationId: session.session.activeOrganizationId,
		uploadedBy: session.user.id,
		folderId: fileData.folderId || null,
		isEncrypted: false,
	});

	revalidatePath("/");
	return { success: true };
}

export async function listFiles(folderId?: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		return [];
	}

	const conditions = [
		eq(files.organizationId, session.session.activeOrganizationId),
	];

	if (folderId) {
		conditions.push(eq(files.folderId, folderId));
	}

	const dbFiles = await db.query.files.findMany({
		where: (table, { eq, and }) => and(...conditions),
		orderBy: (table, { desc }) => [desc(table.createdAt)],
		with: {
			uploader: {
				columns: { name: true, image: true }
			}
		}
	});

	// Map to FileItem format used by the UI
	return dbFiles.map((file) => ({
		id: file.id,
		name: file.name,
		type: file.type as any, // Cast to match UI types
		size: formatBytes(file.size),
		sizeBytes: file.size,
		modifiedAt: formatDate(file.updatedAt),
		createdAt: formatDate(file.createdAt),
		starred: false, // Not implemented in DB yet
		shared: false, // Not implemented in DB yet
		access: "owner" as const,
		folderId: file.folderId,
		owner: file.uploader ? { name: file.uploader.name, image: file.uploader.image } : null
	}));
}

export async function listSharedFiles() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user.id) {
		return [];
	}

	const sharedFiles = await db
		.select({
			id: files.id,
			name: files.name,
			type: files.type,
			size: files.size,
			folderId: files.folderId,
			createdAt: files.createdAt,
			updatedAt: files.updatedAt,
			uploaderName: user.name,
			uploaderImage: user.image,
		})
		.from(fileCollaborators)
		.innerJoin(files, eq(fileCollaborators.fileId, files.id))
		.leftJoin(user, eq(files.uploadedBy, user.id))
		.where(eq(fileCollaborators.userId, session.user.id))
		.orderBy(desc(files.createdAt));

	return sharedFiles.map((file) => ({
		id: file.id,
		name: file.name,
		type: file.type as any,
		size: formatBytes(file.size),
		sizeBytes: file.size,
		modifiedAt: formatDate(file.updatedAt),
		createdAt: formatDate(file.createdAt),
		starred: false,
		shared: true,
		access: "shared" as const,
		folderId: file.folderId,
		owner: (file.uploaderName || file.uploaderImage) ? { name: file.uploaderName, image: file.uploaderImage } : null,
	}));
}

export async function createFolder(
	name: string,
	parentId: string | null = null,
	color: string = "#6B7280",
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		throw new Error("Unauthorized");
	}

	const [newFolder] = await db
		.insert(folders)
		.values({
			name,
			parentId,
			color,
			organizationId: session.session.activeOrganizationId,
		})
		.returning();

	revalidatePath("/");
	return { success: true, folder: newFolder };
}

export async function listFolders(parentId: string | null = null) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		return [];
	}

	const conditions = [
		eq(folders.organizationId, session.session.activeOrganizationId),
	];

	if (parentId) {
		conditions.push(eq(folders.parentId, parentId));
	} else {
		// Only fetch root folders (where parentId is null)
		conditions.push(isNull(folders.parentId));
	}

	const dbFolders = await db.query.folders.findMany({
		where: (table, { eq, and }) => and(...conditions),
		orderBy: (table, { desc }) => [desc(table.createdAt)],
	});

	// For each folder, we need to calculate its size and file count
	// Doing this in a loop for now (could be optimized with a complex join later if needed)
	const foldersWithStats = await Promise.all(
		dbFolders.map(async (folder) => {
			const stats = await db
				.select({
					totalSize: sum(files.size),
					fileCount: count(files.id),
				})
				.from(files)
				.where(eq(files.folderId, folder.id));

			const sizeBytes = Number(stats[0]?.totalSize || 0);

			return {
				id: folder.id,
				name: folder.name,
				color: folder.color,
				filesCount: Number(stats[0]?.fileCount || 0),
				size: formatBytes(sizeBytes),
				sizeBytes: sizeBytes,
				parentId: folder.parentId,
			};
		}),
	);

	return foldersWithStats;
}

export async function getStorageStats() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		return {
			used: 0,
			total: 20 * 1024 * 1024 * 1024, // 20GB default max
			breakdown: [],
		};
	}

	const orgId = session.session.activeOrganizationId;

	// Calculate total used
	const totalStats = await db
		.select({
			totalSize: sum(files.size),
		})
		.from(files)
		.where(eq(files.organizationId, orgId));

	const usedBytes = Number(totalStats[0]?.totalSize || 0);
	const usedGB = Number((usedBytes / (1024 * 1024 * 1024)).toFixed(2));

	// We need to fetch the file names and sizes to categorize them properly
	const allFiles = await db
		.select({
			name: files.name,
			size: files.size,
		})
		.from(files)
		.where(eq(files.organizationId, orgId));

	// Initialize category map based on our canonical fileCategories
	const categoryMap: Record<string, { size: number; color: string }> = {};
	Object.values(fileCategories).forEach((cat) => {
		categoryMap[cat.name] = { size: 0, color: cat.color };
	});

	// Group sizes by category
	allFiles.forEach((file) => {
		const category = getCategoryForFile(file.name);
		const sizeGB = Number(
			(Number(file.size) / (1024 * 1024 * 1024)).toFixed(2),
		);
		if (categoryMap[category.name]) {
			categoryMap[category.name].size += sizeGB;
		}
	});

	const breakdown = Object.entries(categoryMap).map(([type, data]) => ({
		type,
		size: Number(data.size.toFixed(2)),
		color: data.color,
	}));

	return {
		used: usedGB,
		total: 20, // 20 GB fixed constraint for UI now (could come from DB tier)
		breakdown,
	};
}

function formatBytes(bytes: number, decimals = 1) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / k ** i).toFixed(dm)) + " " + sizes[i];
}

function formatDate(date: Date) {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export async function deleteFile(fileId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;
	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));

	if (!file) return { success: false, error: "File not found" };

	if (file.storageKey) {
		try {
			await r2.send(
				new DeleteObjectCommand({
					Bucket: process.env.R2_BUCKET_NAME,
					Key: file.storageKey,
				}),
			);
		} catch (error) {
			console.error("Failed to delete from R2:", error);
		}
	}

	await db
		.delete(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	revalidatePath("/");
	return { success: true };
}

export async function renameFile(fileId: string, name: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;
	await db
		.update(files)
		.set({ name })
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	revalidatePath("/");
	return { success: true };
}

export async function deleteFolder(folderId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;
	// Simplistic deletion. Doesn't clean up nested children in R2 recursively for now.
	await db
		.delete(folders)
		.where(and(eq(folders.id, folderId), eq(folders.organizationId, orgId)));
	revalidatePath("/");
	return { success: true };
}

export async function renameFolder(folderId: string, name: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;
	await db
		.update(folders)
		.set({ name })
		.where(and(eq(folders.id, folderId), eq(folders.organizationId, orgId)));
	revalidatePath("/");
	return { success: true };
}

export async function createShareLink(fileId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;

	// Check if file exists and belongs to the active organization
	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));

	if (!file) throw new Error("File not found or unauthorized");

	// Check if a share link already exists
	const [existingShare] = await db
		.select()
		.from(fileShares)
		.where(eq(fileShares.fileId, file.id));

	if (existingShare) {
		return {
			success: true,
			token: existingShare.token,
			expiresAt: existingShare.expiresAt,
			hasPassword: !!existingShare.passwordHash,
		};
	}

	// Create a new share link
	const token = randomUUID().replace(/-/g, ""); // Simple random string, can be shortened later

	await db.insert(fileShares).values({
		fileId: file.id,
		token,
	});

	return { success: true, token, expiresAt: null, hasPassword: false };
}

export async function getDownloadUrl(storageKey: string) {
	try {
		const signedUrl = await getSignedUrl(
			r2,
			new GetObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: storageKey,
			}),
			{ expiresIn: 3600 }, // 1 hour validity
		);

		return { success: true, url: signedUrl };
	} catch (error) {
		console.error("Error generating download URL:", error);
		return { success: false, error: "Failed to generate signed URL" };
	}
}

export async function getFileByShareToken(token: string) {
	const [share] = await db
		.select({
			shareId: fileShares.id,
			views: fileShares.views,
			expiresAt: fileShares.expiresAt,
			file: {
				id: files.id,
				name: files.name,
				type: files.type,
				size: files.size,
				storageKey: files.storageKey,
				createdAt: files.createdAt,
				updatedAt: files.updatedAt,
			},
		})
		.from(fileShares)
		.innerJoin(files, eq(fileShares.fileId, files.id))
		.where(eq(fileShares.token, token));

	if (!share) {
		return { success: false, error: "Link not found or invalid" };
	}

	if (share.expiresAt && new Date() > share.expiresAt) {
		// Clean up expired tokens optionally
		await db.delete(fileShares).where(eq(fileShares.id, share.shareId));
		return { success: false, error: "Link has expired" };
	}

	// Increment views
	await db
		.update(fileShares)
		.set({ views: share.views + 1 })
		.where(eq(fileShares.id, share.shareId));

	return { success: true, data: share.file };
}

export async function getCodePreview(fileId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user.id) throw new Error("Unauthorized");

	let [file] = session.session.activeOrganizationId
		? await db
				.select()
				.from(files)
				.where(
					and(
						eq(files.id, fileId),
						eq(files.organizationId, session.session.activeOrganizationId),
					),
				)
		: [];

	if (!file) {
		const [sharedFile] = await db
			.select({
				id: files.id,
				name: files.name,
				type: files.type,
				organizationId: files.organizationId,
				folderId: files.folderId,
				uploadedBy: files.uploadedBy,
				storageKey: files.storageKey,
				size: files.size,
				isEncrypted: files.isEncrypted,
				createdAt: files.createdAt,
				updatedAt: files.updatedAt,
			})
			.from(fileCollaborators)
			.innerJoin(files, eq(fileCollaborators.fileId, files.id))
			.where(
				and(
					eq(fileCollaborators.fileId, fileId),
					eq(fileCollaborators.userId, session.user.id),
				),
			);

		file = sharedFile;
	}

	if (!file) throw new Error("File not found or unauthorized");

	const urlResult = await getDownloadUrl(file.storageKey);
	if (!urlResult.success || !urlResult.url) {
		throw new Error("Failed to generate download URL");
	}

	try {
		const response = await fetch(urlResult.url);
		const text = await response.text();

		const lang = getLanguageFromFileName(file.name);

		const codeHtml = await codeToHtml(text, {
			lang: lang as any,
			theme: "houston",
		});

		return { success: true, html: codeHtml, raw: text, file };
	} catch (e) {
		console.error("Serverside fetch/Shiki error:", e);
		return { success: false, error: "Failed to parse code natively", file };
	}
}

export async function updateShareLinkSettings(
	fileId: string,
	settings: { expiresAt: Date | null; password?: string | null },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;

	// Verify ownership/authorization
	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	if (!file) return { success: false, error: "File not found" };

	let passwordHash: string | null = null;
	if (settings.password) {
		// Use native node crypto to hash the password
		// We use a predefined salt or we can generate one. For simplicity and since we just need basic hash here without bringing in bcrypt:
		passwordHash = scryptSync(settings.password, "bault-salt", 64).toString(
			"hex",
		);
	}

	await db
		.update(fileShares)
		.set({
			expiresAt: settings.expiresAt,
			passwordHash: settings.password ? passwordHash : null,
		})
		.where(eq(fileShares.fileId, file.id));

	revalidatePath("/");
	return { success: true };
}

export async function revokeShareLink(fileId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;

	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	if (!file) return { success: false, error: "File not found" };

	await db.delete(fileShares).where(eq(fileShares.fileId, file.id));
	revalidatePath("/");
	return { success: true };
}

export async function shareFileInternally(fileId: string, emails: string[]) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;

	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	if (!file) return { success: false, error: "File not found" };

	// Find the users by their emails
	if (!emails.length)
		return {
			success: true,
			added: 0,
			failedEmails: [],
			alreadyInvited: [],
			selfInvite: false,
		};

	const currentUserEmail = session.user.email;
	const selfInvite = emails.includes(currentUserEmail);
	const emailsToProcess = emails.filter((e) => e !== currentUserEmail);

	const foundUsers = await db
		.select({ id: user.id, email: user.email })
		.from(user)
		.where(inArray(user.email, emailsToProcess));

	const foundUserEmails = new Set(foundUsers.map((u) => u.email));
	const failedEmails = emailsToProcess.filter(
		(email) => !foundUserEmails.has(email),
	);

	const existingCollabs = await db
		.select()
		.from(fileCollaborators)
		.where(eq(fileCollaborators.fileId, file.id));
	const existingUserIds = new Set(existingCollabs.map((c) => c.userId));

	const newUsers = foundUsers.filter((u) => !existingUserIds.has(u.id));
	const alreadyInvitedUsers = foundUsers.filter((u) =>
		existingUserIds.has(u.id),
	);
	const alreadyInvitedEmails = alreadyInvitedUsers.map((u) => u.email);

	const insertData = newUsers.map((u) => ({
		fileId: file.id,
		userId: u.id,
	}));

	if (insertData.length > 0) {
		// ON CONFLICT DO NOTHING is native to postgres but drizzle insert ignores duplicate keys if we don't use onConflictDoNothing
		await db.insert(fileCollaborators).values(insertData).onConflictDoNothing();
	}

	revalidatePath("/");
	return {
		success: true,
		added: insertData.length,
		failedEmails,
		alreadyInvited: alreadyInvitedEmails,
		selfInvite,
	};
}

export async function getInternalCollaborators(fileId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) return [];

	const collaborators = await db
		.select({
			userId: fileCollaborators.userId,
			name: user.name,
			email: user.email,
			image: user.image,
		})
		.from(fileCollaborators)
		.innerJoin(user, eq(fileCollaborators.userId, user.id))
		.where(eq(fileCollaborators.fileId, fileId));

	return collaborators;
}

export async function revokeInternalAccess(fileId: string, userId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.session.activeOrganizationId) throw new Error("Unauthorized");

	const orgId = session.session.activeOrganizationId;

	const [file] = await db
		.select()
		.from(files)
		.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));
	if (!file) return { success: false, error: "File not found" };

	await db
		.delete(fileCollaborators)
		.where(
			and(
				eq(fileCollaborators.fileId, file.id),
				eq(fileCollaborators.userId, userId),
			),
		);

	revalidatePath("/");
	return { success: true };
}
