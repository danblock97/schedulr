import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Trash2, FileX, Clock } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { restorePage, permanentlyDeletePage } from "@/lib/pageActions";

interface TrashListProps {
	userId: string;
}

type Page = Tables<"pages">;

const TrashList: React.FC<TrashListProps> = ({ userId }) => {
	const [pages, setPages] = useState<Page[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTrashedPages = async () => {
		setIsLoading(true);
		setError(null);
		const { data, error: fetchError } = await supabase
			.from("pages")
			.select("*")
			.eq("user_id", userId)
			.not("trashed_at", "is", null)
			.order("trashed_at", { ascending: false });

		if (fetchError) {
			console.error("Error fetching trashed pages:", fetchError);
			setError(fetchError.message);
		} else {
			setPages(data || []);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchTrashedPages();

		const channel = supabase
			.channel(`public:pages:user_id=eq.${userId}:trash`)
			.on<Page>(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "pages",
					filter: `user_id=eq.${userId}`,
				},
				() => {
					console.log("Realtime trash change received, refetching...");
					fetchTrashedPages();
				}
			)
			.subscribe((status, err) => {
				if (status === "SUBSCRIBED") {
					console.log(`Subscribed to trash changes for user ${userId}`);
				}
				if (err) {
					console.error(`Realtime subscription error for trash:`, err);
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId]);

	const handleRestore = async (pageId: string) => {
		const success = await restorePage(pageId);
		if (success) {
			// Optimistically update UI
			setPages(pages.filter((p) => p.id !== pageId));
		}
	};

	const handleDelete = async (pageId: string) => {
		if (
			window.confirm(
				"Are you sure you want to permanently delete this page? This action cannot be undone."
			)
		) {
			const success = await permanentlyDeletePage(pageId);
			if (success) {
				// Optimistically update UI
				setPages(pages.filter((p) => p.id !== pageId));
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-8">
				<div className="animate-pulse">
					<FileX className="h-16 w-16 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">Loading trash...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-8 text-destructive">
				<FileX className="h-16 w-16 mb-4" />
				<p className="font-semibold">Error loading trash</p>
				<p className="text-sm">{error}</p>
			</div>
		);
	}

	if (pages.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-muted rounded-lg m-4 min-h-[300px]">
				<Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
				<h3 className="text-2xl font-semibold text-foreground mb-2">
					Trash is empty
				</h3>
				<p className="text-muted-foreground max-w-md">
					When you delete pages, they will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{pages.map((page) => (
				<Card key={page.id} className="bg-muted/50 flex flex-col">
					<CardHeader className="pb-2">
						<CardTitle className="truncate text-lg">
							{page.title || "Untitled"}
						</CardTitle>
						<CardDescription className="flex items-center text-xs pt-1">
							<Clock className="mr-1 h-3 w-3" />
							Trashed{" "}
							{formatDistanceToNow(new Date(page.trashed_at!), {
								addSuffix: true,
							})}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-grow min-h-[4rem]"></CardContent>
					<CardFooter className="pt-2 flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleRestore(page.id)}
						>
							<ArchiveRestore className="mr-2 h-4 w-4" /> Restore
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => handleDelete(page.id)}
						>
							<Trash2 className="mr-2 h-4 w-4" /> Delete
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

export default TrashList;
