import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragOverEvent,
	DragEndEvent,
	UniqueIdentifier,
	closestCorners,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Column, Task } from "./kanban/types";
import KanbanColumn from "./kanban/KanbanColumn";
import KanbanTask from "./kanban/KanbanTask";
import TaskEditorPanel from "./kanban/TaskEditorPanel";
import { AnimatePresence } from "framer-motion";
import { useKanbanData } from "./kanban/useKanbanData";
import AddColumn from "./kanban/AddColumn";
import EditorHeader from "./EditorHeader";

interface KanbanEditorProps {
	pageData: Tables<"pages">;
	onPageUpdate: (page: Tables<"pages">) => void;
}

const KanbanEditor: React.FC<KanbanEditorProps> = ({
	pageData,
	onPageUpdate,
}) => {
	const {
		columns,
		tasks,
		setColumns,
		setTasks,
		editingTask,
		setEditingTask,
		updateTaskDetails,
		deleteTask,
		updateColumn,
		deleteColumn,
		createNewColumn,
		addTask,
		handleEditTask,
	} = useKanbanData(pageData);

	const navigate = useNavigate();
	const { toast } = useToast();
	const [title, setTitle] = useState(pageData.title || "Untitled");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [savingStatus, setSavingStatus] = useState<
		"idle" | "unsaved" | "saving"
	>("idle");
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [members, setMembers] = useState<Tables<"profiles">[]>([]);

	// Use a ref to hold the latest pageData. Update it on every render.
	// This avoids it being a dependency in the save effect, which would cause loops.
	const pageDataRef = useRef(pageData);
	pageDataRef.current = pageData;

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3, // 3px drag delay
			},
		})
	);

	useEffect(() => {
		const fetchMembers = async () => {
			if (!pageData) return;

			const ownerId = pageData.user_id;
			const sharedWithIds = pageData.shared_with || [];
			const memberIds = [...new Set([ownerId, ...sharedWithIds])];

			if (memberIds.length === 0) {
				setMembers([]);
				return;
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.in("id", memberIds);

			if (error) {
				toast({
					title: "Error fetching members",
					description: error.message,
					variant: "destructive",
				});
				setMembers([]);
			} else {
				setMembers(data || []);
			}
		};

		fetchMembers();
	}, [pageData, toast]);

	useEffect(() => {
		// Syncs title from props, but not when user is actively editing or when there are pending changes.
		if (!isEditingTitle && savingStatus === "idle") {
			setTitle(pageData.title || "Untitled");
		}
	}, [pageData.title, isEditingTitle, savingStatus]);

	const savePage = async (
		newTitle: string,
		newColumns: Column[],
		newTasks: Task[]
	) => {
		if (savingStatus === "saving") return;
		setSavingStatus("saving");
		const contentToSave = { columns: newColumns, tasks: newTasks };

		const { data: updatedPageData, error: supabaseError } = await supabase
			.from("pages")
			.update({
				title: newTitle,
				content: contentToSave as any,
				last_modified_at: new Date().toISOString(),
			})
			.eq("id", pageData.id)
			.select()
			.single();

		if (supabaseError) {
			toast({
				title: "Save Failed",
				description: supabaseError.message,
				variant: "destructive",
			});
			setSavingStatus("unsaved");
		} else if (updatedPageData) {
			onPageUpdate(updatedPageData);
			setSavingStatus("idle");
		}
	};

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);

		const originalContent = JSON.stringify(
			pageDataRef.current.content || { columns: [], tasks: [] }
		);
		const currentContent = JSON.stringify({ columns, tasks });
		const hasChanged =
			title !== pageDataRef.current.title || currentContent !== originalContent;

		if (hasChanged) {
			setSavingStatus("unsaved");
			debounceTimer.current = setTimeout(() => {
				savePage(title, columns, tasks);
			}, 2000);
		} else {
			if (savingStatus !== "saving") {
				setSavingStatus("idle");
			}
		}

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, columns, tasks]);

	const handleDelete = async () => {
		// Confirmation is handled by AlertDialog in the header.
		const { error } = await supabase
			.from("pages")
			.update({ trashed_at: new Date().toISOString() })
			.eq("id", pageData.id);

		if (error) {
			toast({
				title: "Move to Trash Failed",
				description: error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Page Moved to Trash",
				description: `"${pageData.title}" has been moved to trash.`,
			});
			navigate("/workspace");
		}
	};

	const onDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}
		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.task);
			return;
		}
	};

	const onDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id;
		const overId = over.id;
		if (activeId === overId) return;

		const isActiveATask = active.data.current?.type === "Task";
		if (!isActiveATask) return;

		const isOverATask = over.data.current?.type === "Task";
		if (isOverATask) {
			setTasks((currentTasks) => {
				const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
				const overIndex = currentTasks.findIndex((t) => t.id === overId);
				if (
					currentTasks[activeIndex].columnId !==
					currentTasks[overIndex].columnId
				) {
					currentTasks[activeIndex].columnId = currentTasks[overIndex].columnId;
					return arrayMove(currentTasks, activeIndex, overIndex - 1);
				}
				return arrayMove(currentTasks, activeIndex, overIndex);
			});
		}

		const isOverAColumn = over.data.current?.type === "Column";
		if (isOverAColumn) {
			setTasks((currentTasks) => {
				const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
				currentTasks[activeIndex].columnId = overId;
				return arrayMove(currentTasks, activeIndex, activeIndex);
			});
		}
	};

	const onDragEnd = (event: DragEndEvent) => {
		setActiveColumn(null);
		setActiveTask(null);
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id;
		const overId = over.id;
		if (activeId === overId) return;

		const isActiveAColumn = active.data.current?.type === "Column";
		if (isActiveAColumn) {
			setColumns((currentColumns) => {
				const activeColumnIndex = currentColumns.findIndex(
					(col) => col.id === activeId
				);
				const overColumnIndex = currentColumns.findIndex(
					(col) => col.id === overId
				);
				return arrayMove(currentColumns, activeColumnIndex, overColumnIndex);
			});
		}
	};

	return (
		<div className="flex flex-col h-full w-full bg-background text-foreground">
			<EditorHeader
				title={title}
				setTitle={setTitle}
				isEditingTitle={isEditingTitle}
				setIsEditingTitle={setIsEditingTitle}
				savingStatus={savingStatus}
				handleDelete={handleDelete}
				lastModifiedAt={pageData.last_modified_at}
			/>
			<div className="flex-grow overflow-x-auto overflow-y-hidden p-4">
				<DndContext
					sensors={sensors}
					onDragStart={onDragStart}
					onDragOver={onDragOver}
					onDragEnd={onDragEnd}
					collisionDetection={closestCorners}
				>
					<div className="flex gap-4 items-start">
						<SortableContext items={columnsId}>
							<AnimatePresence>
								{columns.map((col) => (
									<KanbanColumn
										key={col.id}
										column={col}
										tasks={tasks.filter((task) => task.columnId === col.id)}
										onAddTask={addTask}
										onEditTask={handleEditTask}
										onDeleteTask={deleteTask}
										onUpdateColumn={updateColumn}
										onDeleteColumn={deleteColumn}
										members={members}
									/>
								))}
							</AnimatePresence>
						</SortableContext>
						<AddColumn onAddColumn={createNewColumn} />
					</div>
					<DragOverlay>
						{activeColumn && (
							<KanbanColumn
								column={activeColumn}
								tasks={tasks.filter(
									(task) => task.columnId === activeColumn.id
								)}
								onAddTask={addTask}
								isOverlay
								onEditTask={handleEditTask}
								onDeleteTask={deleteTask}
								onUpdateColumn={updateColumn}
								onDeleteColumn={deleteColumn}
								members={members}
							/>
						)}
						{activeTask && (
							<KanbanTask
								task={activeTask}
								isOverlay
								onEditTask={handleEditTask}
								onDeleteTask={deleteTask}
								columnTitle={
									columns.find((c) => c.id === activeTask.columnId)?.title ?? ""
								}
								members={members}
							/>
						)}
					</DragOverlay>
				</DndContext>
			</div>
			<TaskEditorPanel
				isOpen={!!editingTask}
				onClose={() => setEditingTask(null)}
				task={editingTask}
				onSave={updateTaskDetails}
				members={members}
			/>
		</div>
	);
};

export default KanbanEditor;
