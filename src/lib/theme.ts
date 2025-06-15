export type Theme = "light" | "dark" | "system";

export const applyTheme = (theme: Theme) => {
	const root = window.document.documentElement;
	root.classList.remove("light", "dark");

	if (theme === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";
		root.classList.add(systemTheme);
	} else {
		root.classList.add(theme);
	}
};
