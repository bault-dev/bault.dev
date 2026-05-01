export type FileCategoryType =
	| "code"
	| "text"
	| "image"
	| "video"
	| "audio"
	| "archive"
	| "unknown";

// Exhaustive map of developer file extensions to Shiki language identifiers
export const languageMap: Record<string, string> = {
	// JavaScript/TypeScript
	js: "javascript",
	jsx: "jsx",
	ts: "typescript",
	tsx: "tsx",
	mjs: "javascript",
	cjs: "javascript",

	// Web technologies
	html: "html",
	htm: "html",
	xml: "xml",
	svg: "xml",
	css: "css",
	scss: "scss",
	sass: "sass",
	less: "less",

	// Data formats
	json: "json",
	yaml: "yaml",
	yml: "yaml",
	toml: "toml",
	csv: "csv",

	// Programming languages
	py: "python",
	java: "java",
	c: "c",
	cpp: "cpp",
	cc: "cpp",
	cxx: "cpp",
	cs: "csharp",
	php: "php",
	rb: "ruby",
	go: "go",
	rs: "rust",
	sql: "sql",
	swift: "swift",
	kt: "kotlin",
	scala: "scala",
	dart: "dart",
	r: "r",
	pl: "perl",
	lua: "lua",

	// Shell/Config
	sh: "bash",
	bash: "bash",
	zsh: "bash", // shiki uses bash for zsh generally
	fish: "fish",
	ps1: "powershell",

	// Documentation
	md: "markdown",
	mdx: "mdx",
	txt: "text",

	// Config files / Special
	env: "dotenv",
	"env.local": "dotenv",
	dockerfile: "dockerfile",
	makefile: "makefile",
	gitignore: "gitignore",
	npmrc: "ini",
	prettierrc: "json",
	conf: "ini",
};

export const getLanguageFromFileName = (fileName: string): string => {
	const lowerName = fileName.toLowerCase();

	// Exact match first (like dockerfile, .env)
	if (languageMap[lowerName]) return languageMap[lowerName];
	if (lowerName.startsWith(".") && languageMap[lowerName.slice(1)]) {
		return languageMap[lowerName.slice(1)];
	}

	// Then by extension
	const extension = lowerName.split(".").pop() || "";
	return languageMap[extension] || "text";
};

export const getFileType = (
	fileName: string,
	mimeType?: string,
): FileCategoryType => {
	if (mimeType) {
		if (mimeType.startsWith("image/x-icon") || mimeType.startsWith("image/"))
			return "image";
		if (mimeType.startsWith("video/")) return "video";
		if (mimeType.startsWith("audio/")) return "audio";
		if (mimeType.startsWith("text/")) return "text";
	}

	const extension = fileName.toLowerCase().split(".").pop() || "";
	const lowerName = fileName.toLowerCase();

	const codeOrTextExtensions = Object.keys(languageMap);
	const imageExtensions = [
		"jpg",
		"jpeg",
		"png",
		"gif",
		"svg",
		"webp",
		"bmp",
		"ico",
		"avif",
	];
	const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"];
	const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
	const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];

	// Exact names that we consider code/config
	if (
		codeOrTextExtensions.includes(lowerName) ||
		(lowerName.startsWith(".") &&
			codeOrTextExtensions.includes(lowerName.slice(1)))
	) {
		return "code";
	}

	if (codeOrTextExtensions.includes(extension)) {
		// We can differentiate plain text from code if needed, but for Shiki they both work.
		if (["txt", "md", "csv", "json"].includes(extension)) return "text";
		return "code";
	}

	if (imageExtensions.includes(extension)) return "image";
	if (videoExtensions.includes(extension)) return "video";
	if (audioExtensions.includes(extension)) return "audio";
	if (archiveExtensions.includes(extension)) return "archive";

	return "unknown";
};

export const isPreviewableCodeOrText = (
	fileName: string,
	mimeType?: string,
): boolean => {
	const type = getFileType(fileName, mimeType);
	return type === "code" || type === "text";
};

export function formatFileSize(bytes?: number, decimals = 1): string {
	if (bytes === undefined || bytes === null) return "Unknown size";
	if (bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date?: Date | string | null): string {
	if (!date) return "Unknown";
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
}
