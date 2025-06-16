export {};

declare global {
	interface Window {
		electron?: {
			isElectron: boolean;
			openExternal: (url: string) => void;
			onUpdateStatus: (cb: (status: string) => void) => void;
			windowAction: (action: "minimize" | "maximize" | "close") => void;
			onSupabaseLogin: (
				cb: (tokens: { access: string; refresh: string }) => void
			) => void;
		};
	}
}
