import React from "react";
import { Link } from "react-router-dom";
import {
	ArrowLeft,
	Save,
	Trash2,
	Share2,
	Loader2,
	Check,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface EditorHeaderProps {
	title: string;
	setTitle: (title: string) => void;
	isEditingTitle: boolean;
	setIsEditingTitle: (isEditing: boolean) => void;
	savingStatus: "idle" | "unsaved" | "saving";
	handleDelete: () => Promise<void>;
	lastModifiedAt: string;
}

const SavingStatus: React.FC<{
	status: EditorHeaderProps["savingStatus"];
	lastModifiedAt: string;
}> = ({ status, lastModifiedAt }) => {
	switch (status) {
		case "saving":
			return (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Saving...
				</>
			);
		case "unsaved":
			return (
				<>
					<AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
					Unsaved changes
				</>
			);
		case "idle":
		default:
			return (
				<>
					Last modified:{" "}
					{formatDistanceToNow(new Date(lastModifiedAt), { addSuffix: true })}
				</>
			);
	}
};

const EditorHeader: React.FC<EditorHeaderProps> = ({
	title,
	setTitle,
	isEditingTitle,
	setIsEditingTitle,
	savingStatus,
	handleDelete,
	lastModifiedAt,
}) => {
	return (
		<header className="p-4 border-b bg-background sticky top-0 z-10">
			<div className="container mx-auto flex items-center justify-between gap-4">
				<Button variant="outline" size="sm" asChild>
					<Link to="/workspace">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Pages
					</Link>
				</Button>
				<div className="flex-1 min-w-0">
					{isEditingTitle ? (
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={() => setIsEditingTitle(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									(e.target as HTMLInputElement).blur();
								}
							}}
							className="text-xl font-semibold h-9"
							autoFocus
						/>
					) : (
						<h1
							className="text-xl font-semibold truncate cursor-pointer hover:bg-muted p-1 -m-1 rounded"
							onClick={() => setIsEditingTitle(true)}
							title="Click to edit title"
						>
							{title}
						</h1>
					)}
					<p className="text-xs text-muted-foreground mt-1 flex items-center">
						<SavingStatus
							status={savingStatus}
							lastModifiedAt={lastModifiedAt}
						/>
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => alert("Share functionality coming soon!")}
						title="Share (Soon)"
					>
						<Share2 className="h-4 w-4" />
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						title="Move to Trash"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</header>
	);
};

export default EditorHeader;
