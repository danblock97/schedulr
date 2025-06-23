import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { type ListItemType } from "@/components/page-editor/list/types";
import { format } from "date-fns";

interface MyTasksProps {
	userId: string;
}

type DashboardTask = ListItemType & {
	pageId: string;
	pageTitle: string;
};

const fetchUpcomingTasks = async (userId: string): Promise<DashboardTask[]> => {
	const { data: pages, error } = await supabase
		.from("pages")
		.select("id, title, content, type")
		.eq("user_id", userId)
		.in("type", ["LIST"])
		.is("trashed_at", null);

	if (error) {
		console.error("Error fetching list pages:", error);
		throw new Error(error.message);
	}

	const tasks: DashboardTask[] = [];

	for (const page of pages) {
		if (page.type === "LIST" && Array.isArray(page.content)) {
			const pageTasks = (page.content as ListItemType[])
				.filter((item) => !item.completed && item.dueDate)
				.map((item) => ({
					...item,
					pageId: page.id,
					pageTitle: page.title || "Untitled",
				}));
			tasks.push(...pageTasks);
		}
	}

	tasks.sort(
		(a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
	);

	return tasks;
};

const MyTasks: React.FC<MyTasksProps> = ({ userId }) => {
	const {
		data: tasks,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["dashboard_tasks", userId],
		queryFn: () => fetchUpcomingTasks(userId),
	});

	return (
		<div>
			<h2 className="text-lg font-semibold mb-3 flex items-center text-muted-foreground">
				<ListTodo className="mr-3 h-5 w-5" />
				My tasks
			</h2>
			<Card className="bg-muted/20 border-0">
				<CardContent className="pt-6">
					{isLoading && (
						<p className="text-center text-muted-foreground">
							Loading tasks...
						</p>
					)}
					{isError && (
						<p className="text-center text-destructive">
							Failed to load tasks.
						</p>
					)}
					{!isLoading &&
						!isError &&
						(tasks && tasks.length > 0 ? (
							<div className="w-full">
								{/* Table header */}
								<div className="grid grid-cols-12 px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase">
									<span className="col-span-6">Task Name</span>
									<span className="col-span-4">List</span>
									<span className="col-span-2 text-right">Due</span>
								</div>
								<ul className="divide-y divide-border">
									{tasks.map((task) => (
										<li key={task.id} className="py-2 first:pt-0 last:pb-0">
											<Link
												to={`/workspace/page/${task.pageId}`}
												className="grid grid-cols-12 items-center px-3 py-1 rounded-md hover:bg-muted/40 transition-colors"
											>
												<span className="col-span-6 truncate font-medium">
													{task.text || "Untitled Task"}
												</span>
												<span className="col-span-4 truncate text-sm text-muted-foreground">
													{task.pageTitle}
												</span>
												<span className="col-span-2 flex items-center justify-end gap-2 text-sm text-muted-foreground">
													{task.dueDate &&
														format(new Date(task.dueDate), "MMM d")}
													<ArrowRight className="h-4 w-4" />
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						) : (
							<div className="text-center text-muted-foreground py-4">
								<p>You have no upcoming tasks.</p>
								<p className="text-sm mt-1">
									Tasks with due dates from your lists will appear here.
								</p>
							</div>
						))}
				</CardContent>
			</Card>
		</div>
	);
};

export default MyTasks;
