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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/datepicker";
import { Task, IssueType, Priority, Comment, Attachment } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { Paperclip, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import IssueTypeIcon from "./IssueTypeIcon";

interface TaskEditorPanelProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (updatedTask: Task) => void;
	members: Tables<"profiles">[];
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
	members,
}) => {
	const [currentUser, setCurrentUser] = React.useState<User | null>(null);
	const { toast } = useToast();
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
	const [attachments, setAttachments] = React.useState<Attachment[]>(
		task?.attachments || []
	);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [preview, setPreview] = React.useState<Attachment | null>(null);
	const [isEditingDescription, setIsEditingDescription] = React.useState(false);

	const form = useForm<z.infer<typeof taskSchema>>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			summary: "",
			description: "",
			assignee: "",
		},
	});

	const [colorMode, setColorMode] = React.useState<"light" | "dark">("light");

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

		const checkTheme = () => {
			const isDark = document.documentElement.classList.contains("dark");
			setColorMode(isDark ? "dark" : "light");
		};

		checkTheme();

		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => {
			observer.disconnect();
		};
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
			setAttachments(task.attachments || []);
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

	const uploadFiles = async (fileList: FileList) => {
		if (!currentUser) return;
		const uploads: Attachment[] = [];
		for (const file of Array.from(fileList)) {
			const filePath = `${currentUser.id}/${Date.now()}_${file.name}`;
			const { error } = await supabase.storage
				.from("attachments")
				.upload(filePath, file, { contentType: file.type });
			if (error) {
				continue;
			}
			const { data: urlData } = supabase.storage
				.from("attachments")
				.getPublicUrl(filePath);
			uploads.push({
				id: filePath,
				name: file.name,
				url: urlData.publicUrl,
				size: file.size,
				mimeType: file.type,
			});
		}
		if (uploads.length) {
			const updated = [...attachments, ...uploads];
			setAttachments(updated);
			onSave({ ...task!, attachments: updated });
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		await uploadFiles(e.target.files);
	};

	const handleRemoveAttachment = (id: string) => {
		const updated = attachments.filter((a) => a.id !== id);
		setAttachments(updated);
		onSave({ ...task!, attachments: updated });
	};

	const handleSave = (values: z.infer<typeof taskSchema>) => {
		if (!task) return;
		const updatedTask: Task = {
			...task,
			...values,
			comments,
			attachments,
			assignee: values.assignee === "unassigned" ? undefined : values.assignee,
			startDate: values.startDate?.toISOString(),
			endDate: values.endDate?.toISOString(),
		};
		onSave(updatedTask);
		toast({
			title: "Task saved",
			description: `${updatedTask.summary} has been updated.`,
		});
	};

	const onSubmit = (values: z.infer<typeof taskSchema>) => {
		handleSave(values);
		onClose();
	};

	const onDescriptionSave = (values: z.infer<typeof taskSchema>) => {
		handleSave(values);
		setIsEditingDescription(false);
	};

	const handleCancelDescriptionEdit = () => {
		form.setValue("description", task?.description || "");
		setIsEditingDescription(false);
	};

	if (!task) return null;

	const descriptionDisplay = isEditingDescription ? (
		<div className="space-y-2">
			<div data-color-mode={colorMode}>
				<MDEditor
					value={form.watch("description")}
					onChange={(value) => form.setValue("description", value)}
					preview="edit"
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					onClick={handleCancelDescriptionEdit}
				>
					Cancel
				</Button>
				<Button type="button" onClick={form.handleSubmit(onDescriptionSave)}>
					Save
				</Button>
			</div>
		</div>
	) : (
		<div
			className="max-w-none p-3 border rounded-md min-h-[100px] cursor-pointer hover:border-primary/50 transition-colors"
			onClick={() => setIsEditingDescription(true)}
		>
			{form.watch("description") ? (
				<div data-color-mode={colorMode}>
					<MDEditor.Markdown
						source={form.watch("description")}
						style={{ backgroundColor: "transparent" }}
					/>
				</div>
			) : (
				<span className="text-muted-foreground">Add a description...</span>
			)}
		</div>
	);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<SheetContent className="w-full sm:max-w-2xl flex flex-col !p-0">
				<SheetHeader className="p-6 pb-0">
					<SheetTitle>
						<FormField
							control={form.control}
							name="summary"
							render={({ field }) => (
								<Input
									{...field}
									className="text-2xl font-bold border-none !ring-offset-0 !ring-0 !shadow-none p-0 h-auto"
									placeholder="Task summary"
								/>
							)}
						/>
					</SheetTitle>
				</SheetHeader>
				<ScrollArea className="flex-grow">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="px-6 pb-6 space-y-6"
						>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>{descriptionDisplay}</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="issueType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Issue Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue>
															<div className="flex items-center gap-2">
																<IssueTypeIcon
																	type={field.value as IssueType}
																	className="h-4 w-4"
																/>
																<span>
																	{field.value || "Select an issue type"}
																</span>
															</div>
														</SelectValue>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{issueTypes.map((type) => (
														<SelectItem key={type} value={type}>
															<div className="flex items-center gap-2">
																<IssueTypeIcon
																	type={type}
																	className="h-4 w-4"
																/>
																<span>{type}</span>
															</div>
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
												defaultValue={field.value}
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

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
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
										<FormItem className="flex flex-col">
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

							<FormField
								control={form.control}
								name="assignee"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Assignee</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Assign to a team member" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={"unassigned"}>Unassigned</SelectItem>
												{members.map((member) => (
													<SelectItem key={member.id} value={member.id}>
														<div className="flex items-center gap-2">
															<Avatar className="h-5 w-5">
																<AvatarImage src={member.avatar_url ?? ""} />
																<AvatarFallback>
																	{member.username?.charAt(0).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<span>{member.username}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Attachments Section */}
							<div>
								<h3 className="text-lg font-semibold mb-2">Attachments</h3>
								<div className="space-y-2">
									{attachments.map((file) => (
										<div
											key={file.id}
											className="flex items-center justify-between p-2 bg-muted rounded-md"
										>
											<a
												href={file.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-sm hover:underline"
												onClick={(e) => {
													e.stopPropagation();
													if (
														file.mimeType.startsWith("image/") ||
														file.mimeType === "application/pdf"
													) {
														e.preventDefault();
														setPreview(file);
													}
												}}
											>
												<Paperclip className="h-4 w-4" />
												<span>{file.name}</span>
												<span className="text-xs text-muted-foreground">
													({(file.size / 1024).toFixed(2)} KB)
												</span>
											</a>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => handleRemoveAttachment(file.id)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
								<Button
									type="button"
									variant="outline"
									className="mt-2 w-full"
									onClick={() => fileInputRef.current?.click()}
								>
									<Upload className="h-4 w-4 mr-2" />
									Add attachment
								</Button>
								<input
									type="file"
									ref={fileInputRef}
									className="hidden"
									onChange={handleFileChange}
									multiple
								/>
							</div>

							{/* Comments Section */}
							<div>
								<h3 className="text-lg font-semibold mb-2">Comments</h3>
								<div className="space-y-4">
									{comments.map((comment) => (
										<div key={comment.id} className="flex items-start gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage />
												<AvatarFallback>
													{comment.authorName?.charAt(0).toUpperCase() || "?"}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-semibold text-sm">
														{comment.authorName || "Anonymous"}
													</span>
													<span className="text-xs text-muted-foreground">
														{new Date(comment.createdAt).toLocaleString()}
													</span>
												</div>
												<p className="text-sm text-muted-foreground mt-1">
													{comment.text}
												</p>
											</div>
										</div>
									))}
								</div>
								<div className="mt-4 flex gap-2">
									<Input
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										placeholder="Add a comment..."
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleAddComment();
											}
										}}
									/>
									<Button onClick={handleAddComment}>Send</Button>
								</div>
							</div>
						</form>
					</Form>
				</ScrollArea>
				<SheetFooter className="flex-col sm:flex-row sm:justify-between items-center gap-2 pt-4 border-t">
					<div>
						{task.createdAt && (
							<span className="text-xs text-muted-foreground">
								Created on {new Date(task.createdAt).toLocaleDateString()}
							</span>
						)}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
					</div>
				</SheetFooter>
				{preview && (
					<Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
						<DialogContent className="max-w-4xl max-h-[90vh]">
							{(() => {
								if (preview.mimeType.startsWith("image/")) {
									return (
										<img
											src={preview.url}
											alt={preview.name}
											className="max-w-full max-h-[80vh] object-contain"
										/>
									);
								}
								if (preview.mimeType === "application/pdf") {
									return (
										<iframe
											src={preview.url}
											className="w-full h-[80vh]"
											title={preview.name}
										/>
									);
								}
								return (
									<div className="p-4">
										<h3 className="font-bold mb-2">
											Unsupported file type for preview
										</h3>
										<p>You can download the file to view it.</p>
										<a
											href={preview.url}
											download
											className="text-primary hover:underline mt-2 inline-block"
										>
											Download {preview.name}
										</a>
									</div>
								);
							})()}
						</DialogContent>
					</Dialog>
				)}
			</SheetContent>
		</Sheet>
	);
};

export default TaskEditorPanel;
