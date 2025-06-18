import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/datepicker";
import { Task, IssueType, Priority, Comment } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface TaskEditorPanelProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (updatedTask: Task) => void;
}

const issueTypes: IssueType[] = [
	"Task",
	"Bug",
	"Story",
	"Feature request",
	"Security",
];
const priorities: Priority[] = ["Low", "Medium", "High", "Urgent"];

const taskSchema = z.object({
	summary: z.string().min(1, "Summary is required."),
	description: z.string().optional(),
	issueType: z
		.enum(["Task", "Bug", "Story", "Feature request", "Security"])
		.optional(),
	priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
	assignee: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
});

const TaskEditorPanel: React.FC<TaskEditorPanelProps> = ({
	task,
	isOpen,
	onClose,
	onSave,
}) => {
	const [currentUser, setCurrentUser] = React.useState<User | null>(null);
	const [newComment, setNewComment] = React.useState<string>("");
	const [comments, setComments] = React.useState<Comment[]>(
		task?.comments || []
	);
	const [authorCache, setAuthorCache] = React.useState<Record<string, string>>(
		{}
	);
	const [currentUsername, setCurrentUsername] = React.useState<
		string | undefined
	>();

	const form = useForm<z.infer<typeof taskSchema>>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			summary: "",
			description: "",
			assignee: "",
		},
	});

	React.useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setCurrentUser(user);
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", user.id)
					.single();
				setCurrentUsername(profile?.username || user.email?.split("@")[0]);
			}
		};
		fetchUser();
	}, []);

	React.useEffect(() => {
		if (task) {
			form.reset({
				summary: task.summary,
				description: task.description || "",
				issueType: task.issueType,
				priority: task.priority,
				assignee: task.assignee || "",
				startDate: task.startDate ? new Date(task.startDate) : undefined,
				endDate: task.endDate ? new Date(task.endDate) : undefined,
			});
			setComments(task.comments || []);
		}
	}, [task, form]);

	// Fetch usernames for comments missing authorName
	React.useEffect(() => {
		async function enrichComments() {
			if (!task || !comments) return;
			const missing = comments.filter((c) => !c.authorName && c.authorId);
			const idsToFetch = [
				...new Set(
					missing
						.filter((c) => c.authorId && !authorCache[c.authorId!])
						.map((c) => c.authorId!)
				),
			];
			if (idsToFetch.length === 0) return;
			const { data, error } = await supabase
				.from("profiles")
				.select("id, username")
				.in("id", idsToFetch);
			if (error || !data) return;
			const newCache: Record<string, string> = { ...authorCache };
			data.forEach((p) => {
				if (p.username) newCache[p.id] = p.username;
			});
			setAuthorCache(newCache);
			setComments((prev) =>
				prev.map((c) => {
					if (!c.authorName && c.authorId && newCache[c.authorId]) {
						return { ...c, authorName: newCache[c.authorId] };
					}
					return c;
				})
			);
			// Persist updates
			if (missing.length > 0) {
				onSave({ ...task, comments: comments });
			}
		}
		enrichComments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [task, comments]);

	const generateId = React.useCallback(() => {
		return `id_${Math.random().toString(36).substr(2, 9)}`;
	}, []);

	const handleAddComment = () => {
		if (!newComment.trim() || !task) return;
		const comment: Comment = {
			id: generateId() as UniqueIdentifier,
			text: newComment.trim(),
			createdAt: new Date().toISOString(),
			authorId: currentUser?.id,
			authorEmail: currentUser?.email || undefined,
			authorName: currentUsername,
		};
		const updatedComments = [...comments, comment];
		setComments(updatedComments);
		onSave({ ...task, comments: updatedComments });
		setNewComment("");
	};

	if (!task) return null;

	const onSubmit = (values: z.infer<typeof taskSchema>) => {
		const updatedTask: Task = {
			...task,
			...values,
			comments,
			assignee: values.assignee === "unassigned" ? undefined : values.assignee,
			startDate: values.startDate?.toISOString(),
			endDate: values.endDate?.toISOString(),
		};
		onSave(updatedTask);
		onClose();
	};

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col">
				<SheetHeader>
					<SheetTitle>Edit Task</SheetTitle>
					<SheetDescription>Update the details of your task.</SheetDescription>
				</SheetHeader>
				<ScrollArea className="flex-grow pr-6 -mr-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6 py-4"
						>
							<FormField
								control={form.control}
								name="summary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Summary</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Fix login button" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Add more details about the task..."
												{...field}
												className="min-h-[120px]"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="issueType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Issue Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value || "unassigned"}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select issue type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{issueTypes.map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="priority"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Priority</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value || "unassigned"}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select priority" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{priorities.map((p) => (
														<SelectItem key={p} value={p}>
															{p}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="assignee"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Assignee</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value || "unassigned"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select assignee" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="unassigned">Unassigned</SelectItem>
												{currentUser && (
													<SelectItem value={currentUser.id}>
														{currentUser.email}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date</FormLabel>
											<FormControl>
												<DatePicker
													date={field.value}
													setDate={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Date</FormLabel>
											<FormControl>
												<DatePicker
													date={field.value}
													setDate={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							{/* Comments section */}
							<div className="pt-4 border-t">
								<h3 className="text-sm font-medium mb-2">Comments</h3>
								<div className="space-y-3 max-h-48 overflow-y-auto pr-2">
									{comments.length > 0 ? (
										comments.map((c) => (
											<div key={c.id} className="border rounded-md p-2 text-sm">
												<p className="whitespace-pre-wrap break-words">
													{c.text}
												</p>
												<span className="text-xs text-muted-foreground block mt-1">
													{c.authorName
														? `${c.authorName} • `
														: c.authorEmail
														? `${c.authorEmail} • `
														: ""}
													{new Date(c.createdAt).toLocaleString()}
												</span>
											</div>
										))
									) : (
										<p className="text-muted-foreground text-sm">
											No comments yet.
										</p>
									)}
								</div>
								<div className="mt-3 flex gap-2">
									<Textarea
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										placeholder="Add a comment..."
										className="flex-grow min-h-[80px]"
									/>
									<Button
										type="button"
										onClick={handleAddComment}
										disabled={!newComment.trim()}
									>
										Add
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</ScrollArea>
				<SheetFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" onClick={form.handleSubmit(onSubmit)}>
						Save changes
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};

export default TaskEditorPanel;
