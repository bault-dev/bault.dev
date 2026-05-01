import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	bigint,
	uuid,
	integer,
	primaryKey,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";

export const folders = pgTable(
	"folder",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		color: text("color").default("#6B7280").notNull(),
		parentId: uuid("parent_id"), // Self-referencing FK
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("folder_org_idx").on(table.organizationId),
		index("folder_parent_idx").on(table.parentId),
	],
);

export const files = pgTable(
	"file",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		type: text("type").notNull(), // MIME type
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		folderId: uuid("folder_id").references(() => folders.id, {
			onDelete: "set null",
		}),
		uploadedBy: text("uploaded_by").references(() => user.id, {
			onDelete: "set null",
		}),
		storageKey: text("storage_key").notNull(),
		size: bigint("size", { mode: "number" }).notNull(),
		isEncrypted: boolean("is_encrypted").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("file_org_idx").on(table.organizationId),
		index("file_folder_idx").on(table.folderId),
	],
);

export const foldersRelations = relations(folders, ({ one, many }) => ({
	organization: one(organization, {
		fields: [folders.organizationId],
		references: [organization.id],
	}),
	parent: one(folders, {
		fields: [folders.parentId],
		references: [folders.id],
		relationName: "parent_child",
	}),
	subfolders: many(folders, { relationName: "parent_child" }),
	files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
	organization: one(organization, {
		fields: [files.organizationId],
		references: [organization.id],
	}),
	folder: one(folders, {
		fields: [files.folderId],
		references: [folders.id],
	}),
	uploader: one(user, {
		fields: [files.uploadedBy],
		references: [user.id],
	}),
}));

export const fileShares = pgTable("file_shares", {
	id: uuid("id").primaryKey().defaultRandom(),
	fileId: uuid("file_id")
		.notNull()
		.references(() => files.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	views: integer("views").default(0).notNull(),
	passwordHash: text("password_hash"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	expiresAt: timestamp("expires_at"),
});

export const fileSharesRelations = relations(fileShares, ({ one }) => ({
	file: one(files, {
		fields: [fileShares.fileId],
		references: [files.id],
	}),
}));

export const fileCollaborators = pgTable(
	"file_collaborators",
	{
		fileId: uuid("file_id")
			.notNull()
			.references(() => files.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.fileId, table.userId] })],
);

export const fileCollaboratorsRelations = relations(
	fileCollaborators,
	({ one }) => ({
		file: one(files, {
			fields: [fileCollaborators.fileId],
			references: [files.id],
		}),
		user: one(user, {
			fields: [fileCollaborators.userId],
			references: [user.id],
		}),
	}),
);
