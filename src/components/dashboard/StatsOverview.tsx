import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
	LayoutGrid,
	ClipboardList,
	CheckCircle2,
	CalendarDays,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { startOfWeek, endOfWeek } from "date-fns";

interface StatsOverviewProps {
	userId: string;
}

type Page = Tables<"pages">;

type StatsData = {
	pages: number;
	openTasks: number;
	completedTasks: number;
	upcomingEvents: number;
};

const fetchUpcomingEventsCount = async (userId: string): Promise<number> => {
	const today = new Date();
	const weekStart = startOfWeek(today, { weekStartsOn: 0 });
	const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

	const { data, error } = await supabase
		.from("calendar_events")
		.select("id")
		.gte("start_time", weekStart.toISOString())
		.lte("start_time", weekEnd.toISOString());
	if (error) {
		console.error(error);
		return 0;
	}
	return data.length;
};

const fetchStats = async (userId: string): Promise<StatsData> => {
	const { data: pages, error } = await supabase
		.from("pages")
		.select("*")
		.eq("user_id", userId)
		.is("trashed_at", null);

	if (error) {
		console.error("Error fetching stats:", error);
		throw new Error(error.message);
	}

	let pagesCount = 0;
	let openTasks = 0;
	let completedTasks = 0;

	pages.forEach((page: Page) => {
		pagesCount += 1;

		if (page.type === "LIST" && Array.isArray(page.content)) {
			const tasks = page.content as any[];
			openTasks += tasks.filter((t) => !t.completed).length;
			completedTasks += tasks.filter((t) => t.completed).length;
		}

		if (
			page.type === "KANBAN" &&
			typeof page.content === "object" &&
			page.content !== null
		) {
			const { columns, tasks } = page.content as {
				columns?: any[];
				tasks?: any[];
			};
			if (columns && tasks) {
				const lastColumnId = columns[columns.length - 1]?.id;
				tasks.forEach((task: any) => {
					if (task.columnId === lastColumnId) completedTasks += 1;
					else openTasks += 1;
				});
			}
		}
	});

	const upcomingEvents = await fetchUpcomingEventsCount(userId);

	return { pages: pagesCount, openTasks, completedTasks, upcomingEvents };
};

const StatCard: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
}> = ({ icon, label, value }) => (
	<Card className="bg-muted/20 border-0">
		<CardHeader className="flex-row items-center gap-4 p-4">
			<div>
				<CardTitle className="text-sm text-muted-foreground mb-1">
					{label}
				</CardTitle>
				<p className="text-2xl font-bold">{value}</p>
			</div>
			<div className="p-3 rounded-md bg-muted/50 text-primary ml-auto">
				{icon}
			</div>
		</CardHeader>
	</Card>
);

const StatsOverview: React.FC<StatsOverviewProps> = ({ userId }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["dashboard_stats", userId],
		queryFn: () => fetchStats(userId),
	});

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
			{isLoading || isError || !data ? (
				[1, 2, 3, 4].map((k) => (
					<Card key={k} className="bg-muted/20 border-0 h-24 animate-pulse" />
				))
			) : (
				<>
					<StatCard
						icon={<LayoutGrid className="h-5 w-5" />}
						label="Total Pages"
						value={data.pages}
					/>
					<StatCard
						icon={<ClipboardList className="h-5 w-5" />}
						label="Open Tasks"
						value={data.openTasks}
					/>
					<StatCard
						icon={<CheckCircle2 className="h-5 w-5" />}
						label="Completed Tasks"
						value={data.completedTasks}
					/>
					<StatCard
						icon={<CalendarDays className="h-5 w-5" />}
						label="Upcoming Events"
						value={data.upcomingEvents}
					/>
				</>
			)}
		</div>
	);
};

export default StatsOverview;
