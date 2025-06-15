import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
	MoreVertical,
	Trash2,
	FilePlus2,
	FileText,
	Clock,
	KanbanSquare,
	BarChart3,
	Calendar,
	ListTodo,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { createNewPage, trashPage } from "@/lib/pageActions";
import type { User } from "@supabase/supabase-js";

interface PageListProps {
	userId: string;
}

type Page = Tables<"pages">;

const PageIcon = ({ type }: { type: Page["type"] }) => {
	switch (type) {
		case "KANBAN":
			return <KanbanSquare className="mr-2 h-4 w-4 shrink-0" />;
		case "CHART":
			return <BarChart3 className="mr-2 h-4 w-4 shrink-0" />;
		case "CALENDAR":
			return <Calendar className="mr-2 h-4 w-4 shrink-0" />;
		case "LIST":
			return <ListTodo className="mr-2 h-4 w-4 shrink-0" />;
		case "DOCUMENT":
		default:
			return <FileText className="mr-2 h-4 w-4 shrink-0" />;
	}
};

const PageList: React.FC<PageListProps> = ({ userId }) => {
	const [pages, setPages] = useState<Page[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchPages = async () => {
		setIsLoading(true);
		setError(null);
		const { data, error: fetchError } = await supabase
			.from("pages")
			.select("*")
			.eq("user_id", userId)
			.is("trashed_at", null)
			.order("last_modified_at", { ascending: false });

		if (fetchError) {
			console.error("Error fetching pages:", fetchError);
			setError(fetchError.message);
		} else {
			setPages(data || []);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchPages();

		const channel = supabase
			.channel(`public:pages:user_id=eq.${userId}`)
			.on<Page>(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "pages",
					filter: `user_id=eq.${userId}`,
				},
				() => {
					console.log("Realtime page change received, refetching...");
					fetchPages();
				}
			)
			.subscribe((status, err) => {
				if (status === "SUBSCRIBED") {
					console.log(`Subscribed to page changes for user ${userId}`);
				}
				if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || err) {
					console.error(`Realtime subscription error: ${status}`, err);
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId]);

	const handleCreateFirstPage = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (user && user.id === userId) {
			const newPageId = await createNewPage(
				user,
				"DOCUMENT",
				"Untitled Document",
				null
			);
			if (newPageId) {
				navigate(`/workspace/page/${newPageId}`);
			}
		} else {
			console.error(
				"User ID mismatch or user not found for creating first page."
			);
		}
	};

	const handleTrashPage = async (pageId: string) => {
		await trashPage(pageId);
		// Realtime subscription will handle the UI update
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-8">
				<div className="animate-pulse">
					<FileText className="h-16 w-16 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">Loading your pages...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-8 text-destructive">
				<FileText className="h-16 w-16 mb-4" />
				<p className="font-semibold">Error loading pages</p>
				<p className="text-sm">{error}</p>
			</div>
		);
	}

	if (pages.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-lg m-4 min-h-[300px]">
				<img
					src="/placeholder.svg"
					alt="Empty workspace"
					className="w-64 h-48 object-cover rounded-md mb-6 text-muted-foreground"
				/>
				<h3 className="text-2xl font-semibold text-foreground mb-2">
					Your workspace is empty
				</h3>
				<p className="text-muted-foreground mb-6 max-w-md">
					Create your first page to start organizing your thoughts, projects,
					and ideas.
				</p>
				<Button size="lg" onClick={handleCreateFirstPage}>
					<FilePlus2 className="mr-2 h-5 w-5" />
					Create First Page
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{pages.map((page) => (
				<Card
					key={page.id}
					className="hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col group"
				>
					<CardHeader className="pb-2">
						<div className="flex justify-between items-start">
							<CardTitle className="truncate text-lg flex-1">
								<Link
									to={`/workspace/page/${page.id}`}
									className="hover:underline flex items-center"
								>
									<PageIcon type={page.type} />
									<span className="truncate">{page.title || "Untitled"}</span>
								</Link>
							</CardTitle>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => handleTrashPage(page.id)}
										className="text-destructive focus:text-destructive focus:bg-destructive/10"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										<span>Move to Trash</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<CardDescription className="flex items-center text-xs pt-1">
							<Clock className="mr-1 h-3 w-3" />
							Last modified{" "}
							{formatDistanceToNow(new Date(page.last_modified_at), {
								addSuffix: true,
							})}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-grow min-h-[4rem] overflow-hidden py-2">
						<p className="text-sm text-muted-foreground italic line-clamp-2">
							{page.content
								? typeof page.content === "string" && page.content.trim() !== ""
									? "Page has content."
									: typeof page.content === "object"
									? "Page has rich content."
									: "No preview available."
								: "No preview available."}
						</p>
					</CardContent>
					<CardFooter className="pt-2">
						<Button variant="outline" size="sm" asChild className="w-full">
							<Link to={`/workspace/page/${page.id}`}>Open Page</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

export default PageList;
