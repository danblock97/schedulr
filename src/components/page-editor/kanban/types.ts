import type { UniqueIdentifier } from "@dnd-kit/core";

export type IssueType =
	| "Task"
	| "Bug"
	| "Story"
	| "Feature request"
	| "Security";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
	id: UniqueIdentifier;
	columnId: UniqueIdentifier;
	summary: string;
	description?: string;
	issueType?: IssueType;
	assignee?: string;
	startDate?: string;
	endDate?: string;
	priority?: Priority;
	// content field is deprecated, will be migrated to summary
	content?: string;
}

export interface Column {
	id: UniqueIdentifier;
	title: string;
	color?: string;
}
