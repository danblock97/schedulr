import React from "react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Clock } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

interface EventItemProps {
	event: Tables<"calendar_events">;
	onEdit: (event: Tables<"calendar_events">) => void;
	onDelete: (eventId: string) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit, onDelete }) => {
	const startTime = new Date(event.start_time);
	const endTime = new Date(event.end_time);

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-start">
					<div>
						<CardTitle>{event.title}</CardTitle>
						<CardDescription className="flex items-center pt-2">
							<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>{`${format(startTime, "p")} - ${format(
								endTime,
								"p"
							)}`}</span>
						</CardDescription>
					</div>
					<div className="flex space-x-2">
						<Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(event.id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			{event.description && (
				<CardContent>
					<p className="text-sm text-muted-foreground">{event.description}</p>
				</CardContent>
			)}
		</Card>
	);
};

export default EventItem;
