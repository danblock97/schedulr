import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import EditorHeader from "./EditorHeader";
import ListItem from "./list/ListItem";
import { type ListItemType, type Priority } from "./list/types";
import { Button } from "@/components/ui/button";
import { PlusIcon, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ListEditorProps {
	pageData: Tables<"pages">;
	onPageUpdate: (page: Tables<"pages">) => void;
}

const isListItem = (item: unknown): item is ListItemType => {
	if (typeof item !== "object" || item === null) return false;
	const potentialItem = item as { [key: string]: unknown };
	return (
		typeof potentialItem.id === "string" &&
		typeof potentialItem.text === "string" &&
		typeof potentialItem.completed === "boolean"
	);
};

const sanitizeItems = (content: unknown): ListItemType[] => {
	if (!Array.isArray(content)) {
		return [];
	}
	return content.filter(isListItem).map((item) => ({
		...item,
		priority: item.priority || "none",
		dueDate: item.dueDate || null,
	}));
};

const ListEditor: React.FC<ListEditorProps> = ({ pageData, onPageUpdate }) => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [title, setTitle] = useState(pageData.title || "Untitled List");
	const [items, setItems] = useState<ListItemType[]>(() =>
		sanitizeItems(pageData.content)
	);
	const [savingStatus, setSavingStatus] = useState<
		"idle" | "unsaved" | "saving"
	>("idle");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [filters, setFilters] = useState<{
		priority: Priority | "all";
		completed: "all" | "completed" | "active";
	}>({ priority: "all", completed: "all" });

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const updatePageMutation = useMutation({
		mutationFn: async (updatedContent: {
			title?: string;
			content?: ListItemType[];
		}) => {
			setSavingStatus("saving");
			const { data: updatedPageData, error } = await supabase
				.from("pages")
				.update({
					...updatedContent,
					last_modified_at: new Date().toISOString(),
				})
				.eq("id", pageData.id)
				.select()
				.single();

			if (error) throw new Error(error.message);
			return updatedPageData;
		},
		onSuccess: (updatedPageData) => {
			if (updatedPageData) {
				onPageUpdate(updatedPageData);
				// Resync local state to match the saved data
				setTitle(updatedPageData.title || "Untitled List");
				setItems(sanitizeItems(updatedPageData.content));
				setSavingStatus("idle");
				toast({ title: "Saved" });
			}
		},
		onError: (error: Error) => {
			toast({
				title: "Save Failed",
				description: error.message,
				variant: "destructive",
			});
			setSavingStatus("unsaved");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["pages", pageData.user_id] });
		},
	});

	useEffect(() => {
		const originalTitle = pageData.title || "Untitled List";
		const originalItemsString = JSON.stringify(sanitizeItems(pageData.content));
		const currentItemsString = JSON.stringify(items);

		const titleChanged = originalTitle !== title;
		const itemsChanged = originalItemsString !== currentItemsString;

		if (titleChanged || itemsChanged) {
			setSavingStatus("unsaved");
			const timer = setTimeout(() => {
				const payload: { title?: string; content?: ListItemType[] } = {};
				if (titleChanged) {
					payload.title = title;
				}
				if (itemsChanged) {
					payload.content = items;
				}
				if (Object.keys(payload).length > 0) {
					updatePageMutation.mutate(payload);
				}
			}, 2000); // 2-second debounce
			return () => clearTimeout(timer);
		}
	}, [title, items, pageData, updatePageMutation]);

	const handleDelete = async () => {
		if (
			!window.confirm(
				`Are you sure you want to move "${pageData.title}" to the trash?`
			)
		) {
			return;
		}
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

	const handleAddItem = () => {
		const newItem: ListItemType = {
			id: uuidv4(),
			text: "",
			completed: false,
			priority: "none",
			dueDate: null,
		};
		setItems((prev) => [newItem, ...prev]);
	};

	const handleUpdateItem = (id: string, updates: Partial<ListItemType>) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
		);
	};

	const handleDeleteItem = (id: string) => {
		setItems((prev) => prev.filter((item) => item.id !== id));
	};

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	}

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const priorityMatch =
				filters.priority === "all" || item.priority === filters.priority;
			let completedMatch = true;
			if (filters.completed === "completed") {
				completedMatch = item.completed;
			} else if (filters.completed === "active") {
				completedMatch = !item.completed;
			}
			return priorityMatch && completedMatch;
		});
	}, [items, filters]);

	const itemIds = useMemo(() => items.map((item) => item.id), [items]);

	return (
		<div className="flex flex-col h-full bg-background">
			<EditorHeader
				title={title}
				setTitle={setTitle}
				isEditingTitle={isEditingTitle}
				setIsEditingTitle={setIsEditingTitle}
				savingStatus={savingStatus}
				handleDelete={handleDelete}
				lastModifiedAt={pageData.last_modified_at}
			/>
			<div className="flex-grow p-4 md:p-8 flex justify-center">
				<div className="w-full max-w-4xl space-y-4">
					<div className="flex justify-between items-center">
						<div className="flex gap-2 items-center">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select
								value={filters.priority}
								onValueChange={(value: Priority | "all") =>
									setFilters((f) => ({ ...f, priority: value }))
								}
							>
								<SelectTrigger className="w-[120px] h-9">
									<SelectValue placeholder="Filter priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Priorities</SelectItem>
									<SelectItem value="none">No Priority</SelectItem>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={filters.completed}
								onValueChange={(value: "all" | "completed" | "active") =>
									setFilters((f) => ({ ...f, completed: value }))
								}
							>
								<SelectTrigger className="w-[120px] h-9">
									<SelectValue placeholder="Filter status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button onClick={handleAddItem}>
							<PlusIcon className="mr-2 h-4 w-4" /> Add Item
						</Button>
					</div>

					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 px-2"></TableHead>
									<TableHead className="w-12 px-2"></TableHead>
									<TableHead className="pr-2">Task</TableHead>
									<TableHead className="w-40 px-2">Priority</TableHead>
									<TableHead className="w-48 px-2">Due Date</TableHead>
									<TableHead className="w-12 px-2 text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={itemIds}
									strategy={verticalListSortingStrategy}
								>
									<TableBody>
										<AnimatePresence>
											{filteredItems.map((item) => (
												<ListItem
													key={item.id}
													item={item}
													onUpdate={handleUpdateItem}
													onDelete={handleDeleteItem}
												/>
											))}
										</AnimatePresence>
									</TableBody>
								</SortableContext>
							</DndContext>
						</Table>
					</div>

					{items.length === 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-center py-10 text-muted-foreground border-2 border-dashed border-muted/50 rounded-lg"
						>
							<p className="text-lg font-medium">Your list is empty!</p>
							<p className="text-sm">Click "Add Item" to get started.</p>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ListEditor;
