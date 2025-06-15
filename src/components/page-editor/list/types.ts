export type Priority = "none" | "low" | "medium" | "high";

export type ListItemType = {
	id: string;
	text: string;
	completed: boolean;
	priority?: Priority;
	dueDate?: string | null;
};
