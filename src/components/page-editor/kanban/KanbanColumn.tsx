import React, { useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import KanbanTask from "./KanbanTask";
import { Column, Task } from "./types";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AnimatePresence } from "framer-motion";

interface KanbanColumnProps {
	column: Column;
	tasks: Task[];
	onAddTask: (columnId: Column["id"]) => void;
	isOverlay?: boolean;
	onEditTask: (id: UniqueIdentifier) => void;
	onDeleteTask: (id: UniqueIdentifier) => void;
	onUpdateColumn: (id: UniqueIdentifier, title: string) => void;
	onDeleteColumn: (id: UniqueIdentifier) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
	column,
	tasks,
	onAddTask,
	isOverlay,
	onEditTask,
	onDeleteTask,
	onUpdateColumn,
	onDeleteColumn,
}) => {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		},
		disabled: isEditingTitle,
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const taskIds = tasks.map((task) => task.id);

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="w-[350px] h-[500px] bg-muted rounded-lg flex flex-col"
			></div>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`w-[350px] flex-shrink-0 h-fit max-h-[calc(100vh-120px)] flex flex-col ${
				isOverlay ? "ring-2 ring-primary" : ""
			}`}
		>
			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the column and all its tasks. This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => onDeleteColumn(column.id)}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div
				{...attributes}
				{...listeners}
				className="p-3 flex items-center justify-between cursor-grab text-muted-foreground"
				onDoubleClick={() => setIsEditingTitle(true)}
			>
				<div className="flex items-center gap-2 flex-grow min-w-0">
					<span
						className="w-2 h-2 rounded-full flex-shrink-0"
						style={{ backgroundColor: column.color || "gray" }}
					/>
					{!isEditingTitle ? (
						<h3 className="font-semibold text-foreground truncate">
							{column.title}
						</h3>
					) : (
						<Input
							value={column.title}
							onChange={(e) => onUpdateColumn(column.id, e.target.value)}
							autoFocus
							onBlur={() => setIsEditingTitle(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") setIsEditingTitle(false);
							}}
							className="bg-transparent text-base font-semibold border-none focus:ring-0 p-0 h-auto text-foreground"
						/>
					)}
					<span className="text-sm text-muted-foreground">{tasks.length}</span>
				</div>
				<div className="flex items-center flex-shrink-0">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground hover:text-foreground"
							>
								<MoreHorizontal className="h-5 w-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onSelect={() => setIsEditingTitle(true)}
								className="cursor-pointer"
							>
								<Pencil className="mr-2 h-4 w-4" /> Edit title
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setShowDeleteConfirm(true)}
								className="cursor-pointer text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" /> Delete column
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="flex-grow flex flex-col gap-2 px-2 overflow-y-auto">
				<SortableContext items={taskIds}>
					<AnimatePresence>
						{tasks.map((task) => (
							<KanbanTask
								key={task.id}
								task={task}
								onEditTask={onEditTask}
								onDeleteTask={onDeleteTask}
								columnTitle={column.title}
							/>
						))}
					</AnimatePresence>
				</SortableContext>
			</div>
			<div className="px-2 py-1">
				<Button
					variant="ghost"
					className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
					onClick={() => onAddTask(column.id)}
				>
					<PlusCircle className="mr-2 h-4 w-4" />
					New issue
				</Button>
			</div>
		</div>
	);
};

export default KanbanColumn;
