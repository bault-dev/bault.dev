import {
	Settings,
	LayoutTemplate,
	TerminalSquare,
	BookText,
	Database,
	File,
	LucideIcon,
} from "lucide-react";

export type CategoryName =
	| "Configs & Secrets"
	| "UI & Components"
	| "Scripts & Core"
	| "Docs & Context"
	| "Data & Assets"
	| "Other";

export interface CategorySpec {
	name: CategoryName;
	color: string;
	icon: LucideIcon;
	extensions: string[];
}

export const fileCategories: Record<CategoryName, CategorySpec> = {
	"Configs & Secrets": {
		name: "Configs & Secrets",
		color: "#8B5CF6", // Purple from mock UI (was Images)
		icon: Settings,
		extensions: [
			"env",
			"env.local",
			"yml",
			"yaml",
			"conf",
			"npmrc",
			"prettierrc",
			"config.js",
			"dockerfile",
			"makefile",
			"gitignore",
			"toml",
		],
	},
	"UI & Components": {
		name: "UI & Components",
		color: "#EC4899", // Pink from mock UI (was Videos)
		icon: LayoutTemplate,
		extensions: [
			"tsx",
			"jsx",
			"vue",
			"svelte",
			"css",
			"scss",
			"sass",
			"less",
			"html",
			"htm",
			"xml",
		],
	},
	"Scripts & Core": {
		name: "Scripts & Core",
		color: "#F59E0B", // Amber from mock UI (was Documents)
		icon: TerminalSquare,
		extensions: [
			"ts",
			"js",
			"mjs",
			"cjs",
			"py",
			"sh",
			"bash",
			"zsh",
			"fish",
			"ps1",
			"go",
			"rs",
			"java",
			"c",
			"cpp",
			"cc",
			"cxx",
			"cs",
			"php",
			"rb",
			"sql",
			"swift",
			"kt",
			"scala",
			"dart",
			"r",
			"pl",
			"lua",
		],
	},
	"Docs & Context": {
		name: "Docs & Context",
		color: "#10B981", // Emerald from mock UI (was Archives)
		icon: BookText,
		extensions: ["md", "mdx", "txt", "cursorrules", "pdf", "docx"],
	},
	"Data & Assets": {
		name: "Data & Assets",
		color: "#06B6D4", // Cyan from mock UI
		icon: Database,
		extensions: [
			"json",
			"csv",
			"svg",
			"png",
			"jpg",
			"jpeg",
			"gif",
			"webp",
			"avif",
			"mp4",
			"mp3",
		],
	},
	Other: {
		name: "Other",
		color: "#6B7280", // Gray from mock UI
		icon: File,
		extensions: [], // Fallback
	},
};

export function getCategoryForFile(filename: string): CategorySpec {
	// First check for exact full name matches (like .env or .cursorrules or dockerfile)
	const lowerName = filename.toLowerCase();

	for (const category of Object.values(fileCategories)) {
		// Exact Match check inside extensions list (e.g., config.js, .env)
		if (
			category.extensions.some(
				(ext) => lowerName === ext || lowerName === `.${ext}`,
			)
		) {
			return category;
		}
	}

	// Then check by extension
	const parts = lowerName.split(".");
	const extension = parts.length > 1 ? parts.pop() : "";

	if (!extension) {
		return fileCategories["Other"];
	}

	for (const category of Object.values(fileCategories)) {
		if (category.extensions.includes(extension)) {
			return category;
		}
	}

	return fileCategories["Other"];
}
