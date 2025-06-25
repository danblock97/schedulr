import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Trash2,
	User,
	Calendar,
	CheckCircle2,
	XCircle,
	MessageCircle,
	MoreHorizontal,
	GripVertical,
	Edit,
} from "lucide-react";
import { Task } from "./types";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { format } from "date-fns";
import { motion } from "framer-motion";
import IssueTypeIcon from "./IssueTypeIcon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface KanbanTaskProps {
	task: Task;
	isOverlay?: boolean;
	onEditTask: (id: UniqueIdentifier) => void;
	onDeleteTask: (id: UniqueIdentifier) => void;
	columnTitle?: string;
	members: Tables<"profiles">[];
}

const KanbanTask: React.FC<KanbanTaskProps> = ({
	task,
	isOverlay,
	onEditTask,
	onDeleteTask,
	columnTitle,
	members,
}) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		},
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const assignee = React.useMemo(() => {
		if (!task.assignee || !members) return null;
		return members.find((member) => member.id === task.assignee);
	}, [task.assignee, members]);

	const handleEdit = () => {
		onEditTask(task.id);
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border border-dashed bg-background/80"
			/>
		);
	}

	const hasComments = task.comments && task.comments.length > 0;
	const hasFooterContent =
		task.priority ||
		task.issueType ||
		task.assignee ||
		task.endDate ||
		hasComments;
	const isResolved = columnTitle === "Resolved" || columnTitle === "Done";
	const isWontFix = columnTitle === "Won't fix";

	return (
		<motion.div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="mb-2"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, transition: { duration: 0.1 } }}
			transition={{ duration: 0.2, ease: "easeOut" }}
		>
			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the task. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => onDeleteTask(task.id)}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Card
				className={`group transition-shadow duration-200 shadow-sm cursor-pointer bg-card/50 dark:bg-gradient-to-b dark:from-neutral-800/80 dark:to-neutral-900/80 border border-transparent hover:border-border/80 text-card-foreground ${
					isOverlay ? "ring-2 ring-primary" : ""
				}`}
				onClick={handleEdit}
			>
				<CardContent className="p-3 flex flex-col items-start gap-2">
					<div className="w-full flex items-start gap-2">
						<div className="flex-shrink-0 pt-1">
							{isResolved ? (
								<CheckCircle2 className="h-4 w-4 text-green-500" />
							) : isWontFix ? (
								<XCircle className="h-4 w-4 text-red-500" />
							) : (
								<IssueTypeIcon
									type={task.issueType}
									className="h-4 w-4 text-muted-foreground"
								/>
							)}
						</div>
						<p className="flex-grow text-sm whitespace-pre-wrap">
							{task.summary}
						</p>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								setShowDeleteConfirm(true);
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
					{hasFooterContent && (
						<div className="pl-8 w-full flex items-center justify-between flex-wrap gap-2">
							<div className="flex gap-2 flex-wrap items-center">
								{task.issueType && (
									<Badge variant="secondary" className="font-normal">
										{task.issueType}
									</Badge>
								)}
								{task.priority && (
									<Badge
										variant="default"
										className={`capitalize border-none font-normal
                      ${
												(task.priority === "Urgent" ||
													task.priority === "High") &&
												"bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300"
											}
                      ${
												task.priority === "Medium" &&
												"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300"
											}
                      ${
												task.priority === "Low" &&
												"bg-blue-100 text-blue-800 dark:bg-neutral-700 dark:text-neutral-300"
											}
                    `}
									>
										{task.priority}
									</Badge>
								)}
								{hasComments && (
									<div className="flex items-center gap-1 text-muted-foreground text-xs">
										<MessageCircle className="h-4 w-4" />
										<span>{task.comments!.length}</span>
									</div>
								)}
							</div>
							<div className="flex items-center gap-3 text-muted-foreground">
								{assignee && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Avatar className="h-6 w-6">
													<AvatarImage src={assignee.avatar_url ?? ""} />
													<AvatarFallback>
														{assignee.username?.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
											</TooltipTrigger>
											<TooltipContent>
												<p>Assigned to {assignee.username || "User"}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{task.endDate && (
									<div className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										<span className="text-xs">
											{format(new Date(task.endDate), "MMM d")}
										</span>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="absolute top-1 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 bg-background/50 backdrop-blur-sm"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onSelect={() => onEditTask(task.id)}>
							<Edit className="mr-2 h-4 w-4" /> Open
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => onDeleteTask(task.id)}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" /> Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</motion.div>
	);
};

export default KanbanTask;
