const useIsElectron = (): boolean => {
	return (
		typeof window !== "undefined" && !!(window as any).electron?.isElectron
	);
};

export default useIsElectron;
