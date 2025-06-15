import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Column, Task } from "./types";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

function generateId() {
	return `id_${Math.random().toString(36).substr(2, 9)}`;
}

const defaultCols: Column[] = [
	{ id: "todo", title: "Backlog", color: "#6B7280" },
	{ id: "inprogress", title: "In Progress", color: "#3B82F6" },
	{ id: "review", title: "In Review", color: "#F97316" },
	{ id: "done", title: "Done", color: "#16A34A" },
];

const defaultTasks: Task[] = [
	{
		id: generateId(),
		columnId: "todo",
		summary: "Project setup",
		priority: "High",
		issueType: "Task",
	},
	{
		id: generateId(),
		columnId: "todo",
		summary: "Develop main feature",
		priority: "High",
		issueType: "Story",
	},
	{
		id: generateId(),
		columnId: "inprogress",
		summary: "Testing and QA",
		priority: "Medium",
		issueType: "Bug",
	},
	{
		id: generateId(),
		columnId: "review",
		summary: "Code review for feature",
		priority: "Medium",
		issueType: "Feature request",
	},
];

const colors = [
	"#3B82F6",
	"#EF4444",
	"#EAB308",
	"#8B5CF6",
	"#16A34A",
	"#6B7280",
	"#F97316",
];
function getRandomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}

export const useKanbanData = (pageData: Tables<"pages">) => {
	const { toast } = useToast();
	const [columns, setColumns] = useState<Column[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	useEffect(() => {
		if (
			pageData.content &&
			typeof pageData.content === "object" &&
			!Array.isArray(pageData.content)
		) {
			// Migration for old object-based Kanban structure
			if (
				"columnOrder" in pageData.content &&
				(pageData.content as any).columns &&
				!Array.isArray((pageData.content as any).columns)
			) {
				const {
					columns: oldColumns,
					tasks: oldTasks,
					columnOrder,
				} = pageData.content as any;

				const newColumns: Column[] = columnOrder.map((columnId: string) => ({
					id: oldColumns[columnId].id,
					title: oldColumns[columnId].title,
					color: getRandomColor(),
				}));

				let allTasks: Task[] = [];
				if (oldTasks) {
					allTasks = Object.values(oldTasks).map((task: any) => {
						const column = Object.values(oldColumns).find((c: any) =>
							c.taskIds.includes(task.id)
						);
						return {
							id: task.id,
							summary: task.content || `New task`,
							columnId: column ? (column as any).id : columnOrder[0],
						};
					});
				}

				setColumns(newColumns);
				setTasks(allTasks);
				setIsDataLoaded(true);
				return;
			}

			const { columns: savedColumns, tasks: savedTasks } = pageData.content as {
				columns?: Column[];
				tasks?: Task[];
			};
			if (savedColumns && savedTasks) {
				const migratedTasks = savedTasks.map((task) => {
					const anyTask = task as any;
					if (anyTask.content && !anyTask.summary) {
						const { content, ...rest } = anyTask;
						return { ...rest, summary: content };
					}
					return task;
				});
				setColumns(savedColumns);
				setTasks(migratedTasks);
				setIsDataLoaded(true);
				return;
			}
		}
		setColumns(defaultCols);
		setTasks(defaultTasks);
		setIsDataLoaded(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageData.id, JSON.stringify(pageData.content)]);

	const updateTaskDetails = (updatedTask: Task) => {
		setTasks((prevTasks) => {
			const newTasks = prevTasks.map((task) => {
				if (task.id !== updatedTask.id) return task;
				return updatedTask;
			});
			return newTasks;
		});
	};

	const deleteTask = (id: UniqueIdentifier) => {
		setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
	};

	const updateColumn = (id: UniqueIdentifier, title: string) => {
		setColumns((prevCols) => {
			const newCols = prevCols.map((col) => {
				if (col.id !== id) return col;
				return { ...col, title };
			});
			return newCols;
		});
	};

	const deleteColumn = (id: UniqueIdentifier) => {
		setColumns((prevCols) => prevCols.filter((col) => col.id !== id));
		setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== id));
	};

	const createNewColumn = (title: string) => {
		const columnToAdd: Column = {
			id: generateId(),
			title: title.trim(),
			color: getRandomColor(),
		};
		setColumns((prev) => [...prev, columnToAdd]);
	};

	const addTask = (columnId: UniqueIdentifier) => {
		const newTask: Task = {
			id: generateId(),
			columnId,
			summary: `New task`,
		};
		setTasks((prev) => [...prev, newTask]);
		setEditingTask(newTask);
	};

	const handleEditTask = (taskId: UniqueIdentifier) => {
		const taskToEdit = tasks.find((t) => t.id === taskId);
		if (taskToEdit) {
			setEditingTask(taskToEdit);
		}
	};

	return {
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
	};
};
