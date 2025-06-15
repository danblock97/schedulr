import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface UpcomingEventsProps {
	userId: string;
}

type CalendarEventWithPage = Tables<"calendar_events"> & {
	pages: { id: string; title: string } | null;
};

const fetchUpcomingEvents = async (
	userId: string
): Promise<CalendarEventWithPage[]> => {
	const today = new Date();
	const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
	const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

	const { data, error } = await supabase
		.from("calendar_events")
		.select(
			`
            *,
            pages (id, title)
        `
		)
		.gte("start_time", weekStart.toISOString())
		.lte("start_time", weekEnd.toISOString())
		.order("start_time", { ascending: true });

	if (error) {
		console.error("Error fetching calendar events:", error);
		throw new Error(error.message);
	}

	return data as CalendarEventWithPage[];
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ userId }) => {
	const {
		data: events,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["dashboard_events", userId, "current_week"],
		queryFn: () => fetchUpcomingEvents(userId),
	});

	return (
		<div>
			<h2 className="text-lg font-semibold mb-3 flex items-center text-muted-foreground">
				<CalendarIcon className="mr-3 h-5 w-5" />
				Upcoming events this week
			</h2>
			<Card className="bg-muted/20 border-0">
				<CardContent className="pt-6">
					{isLoading && (
						<p className="text-center text-muted-foreground">
							Loading events...
						</p>
					)}
					{isError && (
						<p className="text-center text-destructive">
							Failed to load events.
						</p>
					)}
					{!isLoading &&
						!isError &&
						(events && events.length > 0 ? (
							<ul className="space-y-3">
								{events.map((event) => (
									<li key={event.id}>
										<Link
											to={`/workspace/page/${event.page_id}`}
											className="block p-3 rounded-md hover:bg-muted/40 transition-colors"
										>
											<div className="flex justify-between items-center">
												<div>
													<p className="font-medium">{event.title}</p>
													<p className="text-sm text-muted-foreground">
														{format(
															new Date(event.start_time),
															"EEEE, MMM d @ h:mm a"
														)}
													</p>
													<p className="text-sm text-muted-foreground">
														In calendar:{" "}
														<span className="font-semibold">
															{event.pages?.title || "Untitled"}
														</span>
													</p>
												</div>
												<ArrowRight className="h-4 w-4 text-muted-foreground" />
											</div>
										</Link>
									</li>
								))}
							</ul>
						) : (
							<div className="text-center text-muted-foreground py-4">
								<p>No upcoming events this week.</p>
								<p className="text-sm mt-1">
									Events from your calendars will appear here.
								</p>
							</div>
						))}
				</CardContent>
			</Card>
		</div>
	);
};

export default UpcomingEvents;
