import type { UniqueIdentifier } from "@dnd-kit/core";

export type IssueType =
	| "Task"
	| "Bug"
	| "Story"
	| "Feature request"
	| "Security";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Comment {
	id: UniqueIdentifier;
	authorId?: string;
	authorEmail?: string;
	authorName?: string;
	text: string;
	createdAt: string;
}

export interface Attachment {
	id: string;
	name: string;
	url: string;
	size: number;
	mimeType: string;
}

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
	/** Optional list of comments left on this task */
	comments?: Comment[];
	/** Files attached to this task */
	attachments?: Attachment[];
	// content field is deprecated, will be migrated to summary
	content?: string;
}

export interface Column {
	id: UniqueIdentifier;
	title: string;
	color?: string;
}
