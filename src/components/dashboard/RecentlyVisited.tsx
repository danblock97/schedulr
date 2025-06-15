import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import PageCard from "./PageCard";

interface RecentlyVisitedProps {
	userId: string;
}

const RecentlyVisited: React.FC<RecentlyVisitedProps> = ({ userId }) => {
	const {
		data: pages,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["pages", userId, "recent"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("pages")
				.select("*")
				.eq("user_id", userId)
				.is("trashed_at", null)
				.order("last_modified_at", { ascending: false })
				.limit(6);
			if (error) throw error;
			return data;
		},
	});

	if (isLoading) {
		return (
			<div>
				<h2 className="text-lg font-semibold mb-3 text-muted-foreground">
					Recently visited
				</h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return <div>Error loading recent pages: {error.message}</div>;
	}

	return (
		<div>
			<h2 className="text-lg font-semibold mb-3 text-muted-foreground">
				Recently visited
			</h2>
			{pages && pages.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{pages.map((page: Tables<"pages">) => (
						<PageCard key={page.id} page={page} />
					))}
				</div>
			) : (
				<div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">
					<p>No recently visited pages.</p>
					<p>Create a new page to get started!</p>
				</div>
			)}
		</div>
	);
};

export default RecentlyVisited;
