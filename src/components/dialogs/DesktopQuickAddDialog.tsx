import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useIsElectron from "@/hooks/useIsElectron";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Column, Task } from "@/components/page-editor/kanban/types";
import { type ListItemType } from "@/components/page-editor/list/types";

const DesktopQuickAddDialog: React.FC = () => {
	const isElectron = useIsElectron();
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [text, setText] = useState("");
	const [entryType, setEntryType] = useState<"kanban" | "todo">("kanban");

	useEffect(() => {
		if (!isElectron) return;
		window.electron?.onGlobalQuickAdd(() => {
			setOpen(true);
		});
	}, [isElectron]);

	const handleAdd = async () => {
		if (!text.trim()) return;
		// 1. Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			toast({
				title: "Not signed in",
				description: "Please sign in to add tasks.",
				variant: "destructive",
			});
			return;
		}

		// 2. Find destination page based on type
		const { data: pages, error: pageError } = await supabase
			.from("pages")
			.select("id, content")
			.eq("user_id", user.id)
			.eq("type", entryType === "kanban" ? "KANBAN" : "LIST")
			.is("trashed_at", null)
			.order("created_at", { ascending: true });

		if (pageError || !pages || pages.length === 0) {
			toast({
				title: "No page found",
				description: `You don't have a ${entryType} page yet. Please create one first.`,
				variant: "destructive",
			});
			return;
		}

		const targetPage = pages[0];

		if (entryType === "kanban") {
			// Ensure columns/tasks arrays exist
			let { columns = [], tasks = [] } = (targetPage.content || {}) as {
				columns?: Column[];
				tasks?: Task[];
			};

			if (columns.length === 0) {
				columns = [{ id: "todo", title: "Backlog", color: "#6B7280" }];
			}
			const firstColumnId = columns[0].id;

			const newTask: Task = {
				id: `id_${Math.random().toString(36).slice(2, 11)}`,
				columnId: firstColumnId,
				summary: text.trim(),
			} as Task;

			tasks = [newTask, ...tasks];

			const { error: updateError } = await supabase
				.from("pages")
				.update({
					content: { columns, tasks } as any,
					last_modified_at: new Date().toISOString(),
				})
				.eq("id", targetPage.id);

			if (updateError) {
				toast({
					title: "Failed",
					description: updateError.message,
					variant: "destructive",
				});
				return;
			}
		} else {
			// LIST page
			const items: ListItemType[] = Array.isArray(targetPage.content)
				? (targetPage.content as any)
				: [];

			const newItem: ListItemType = {
				id: uuidv4(),
				text: text.trim(),
				completed: false,
				priority: "none",
				dueDate: null,
			};

			const newItems = [newItem, ...items];

			const { error: updateError } = await supabase
				.from("pages")
				.update({
					content: newItems as any,
					last_modified_at: new Date().toISOString(),
				})
				.eq("id", targetPage.id);

			if (updateError) {
				toast({
					title: "Failed",
					description: updateError.message,
					variant: "destructive",
				});
				return;
			}
		}

		toast({
			title: `Added to ${entryType === "kanban" ? "Kanban" : "Todo"}`,
			description: text,
		});
		setText("");
		setOpen(false);
	};

	if (!isElectron) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-md w-full p-6 rounded-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full">
				<DialogHeader>
					<DialogTitle>Quick Add</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Input
						placeholder="Type your task and press Enter…"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAdd();
							}
						}}
						autoFocus
					/>
					<div>
						<p className="text-sm mb-2 font-medium">Add to:</p>
						<RadioGroup
							defaultValue={entryType}
							onValueChange={(v) => setEntryType(v as "kanban" | "todo")}
							className="grid grid-cols-2 gap-4"
						>
							<label className="flex items-center gap-2 cursor-pointer">
								<RadioGroupItem value="kanban" />
								<span>Kanban</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<RadioGroupItem value="todo" />
								<span>Todo List</span>
							</label>
						</RadioGroup>
					</div>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleAdd}>Add</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DesktopQuickAddDialog;
