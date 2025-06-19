export {};

declare global {
	interface Window {
		electron?: {
			isElectron: boolean;
			openExternal: (url: string) => void;
			onUpdateStatus: (cb: (status: string) => void) => void;
			windowAction: (
				action: "minimize" | "maximize" | "close" | "hide"
			) => void;
			onSupabaseLogin: (
				cb: (tokens: { access: string; refresh: string }) => void
			) => void;
			onGlobalQuickAdd: (cb: () => void) => void;
			setStartup: (opts: { enabled: boolean; hidden: boolean }) => Promise<any>;
			getStartup: () => Promise<{ enabled: boolean; hidden: boolean }>;
			installUpdate: () => Promise<void>;
		};
	}
}
