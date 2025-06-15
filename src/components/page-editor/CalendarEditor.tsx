import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { isSameDay, format } from "date-fns";
import EventItem from "./calendar/EventItem";
import EventFormDialog from "./calendar/EventFormDialog";
import { useToast } from "../ui/use-toast";
import { type DayContentProps } from "react-day-picker";
import EditorHeader from "./EditorHeader";

interface CalendarEditorProps {
	pageData: Tables<"pages">;
	onPageUpdate: (page: Tables<"pages">) => void;
}

const fetchEvents = async (
	pageId: string
): Promise<Tables<"calendar_events">[]> => {
	const { data, error } = await supabase
		.from("calendar_events")
		.select("*")
		.eq("page_id", pageId)
		.order("start_time", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}
	return data || [];
};

const CalendarEditor: React.FC<CalendarEditorProps> = ({
	pageData,
	onPageUpdate,
}) => {
	const navigate = useNavigate();
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] =
		useState<Tables<"calendar_events"> | null>(null);
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const [title, setTitle] = useState(pageData.title || "Untitled");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [savingStatus, setSavingStatus] = useState<
		"idle" | "unsaved" | "saving"
	>("idle");

	useEffect(() => {
		if (pageData.title !== title) {
			setTitle(pageData.title || "Untitled");
			setSavingStatus("idle");
		}
	}, [pageData]);

	const { data: events = [], isLoading: isLoadingEvents } = useQuery({
		queryKey: ["calendarEvents", pageData.id],
		queryFn: () => fetchEvents(pageData.id),
	});

	const deleteEventMutation = useMutation({
		mutationFn: async (eventId: string) => {
			const { error } = await supabase
				.from("calendar_events")
				.delete()
				.eq("id", eventId);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			toast({ title: "Event deleted successfully" });
			queryClient.invalidateQueries({
				queryKey: ["calendarEvents", pageData.id],
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Error deleting event",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const saveTitle = async () => {
		if (savingStatus === "saving" || title === pageData.title) {
			return;
		}
		setSavingStatus("saving");

		const { data: updatedPageData, error } = await supabase
			.from("pages")
			.update({ title: title, last_modified_at: new Date().toISOString() })
			.eq("id", pageData.id)
			.select()
			.single();

		if (error) {
			toast({
				title: "Save Failed",
				description: error.message,
				variant: "destructive",
			});
			setSavingStatus("unsaved");
		} else if (updatedPageData) {
			onPageUpdate(updatedPageData);
			toast({ title: "Page Renamed" });
			setSavingStatus("idle");
		}
	};

	useEffect(() => {
		if (title === pageData.title) {
			return;
		}
		setSavingStatus("unsaved");
		const timer = setTimeout(() => {
			saveTitle();
		}, 2000);
		return () => clearTimeout(timer);
	}, [title, pageData.title]);

	const handleDelete = async () => {
		// Confirmation is handled by AlertDialog in the header.
		const { error } = await supabase
			.from("pages")
			.update({ trashed_at: new Date().toISOString() })
			.eq("id", pageData.id);

		if (error) {
			toast({
				title: "Move to Trash Failed",
				description: error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Page Moved to Trash",
				description: `"${pageData.title}" has been moved to trash.`,
			});
			navigate("/workspace");
		}
	};

	const handleAddEventClick = () => {
		setSelectedEvent(null);
		setIsDialogOpen(true);
	};

	const handleEditEvent = (event: Tables<"calendar_events">) => {
		setSelectedEvent(event);
		setIsDialogOpen(true);
	};

	const handleDeleteEvent = (eventId: string) => {
		deleteEventMutation.mutate(eventId);
	};

	const selectedDayEvents = useMemo(() => {
		if (!date) return [];
		return events.filter((event) =>
			isSameDay(new Date(event.start_time), date)
		);
	}, [date, events]);

	const eventDays = useMemo(
		() => events.map((event) => new Date(event.start_time)),
		[events]
	);

	function DayWithDot(props: DayContentProps) {
		const hasEvent =
			props.date &&
			eventDays.some((eventDate) => isSameDay(eventDate, props.date));
		return (
			<div className="relative h-full w-full flex items-center justify-center">
				<span>{props.date.getDate()}</span>
				{hasEvent && (
					<div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<EditorHeader
				title={title}
				setTitle={setTitle}
				isEditingTitle={isEditingTitle}
				setIsEditingTitle={setIsEditingTitle}
				savingStatus={savingStatus}
				handleDelete={handleDelete}
				lastModifiedAt={pageData.last_modified_at}
			/>
			<div className="flex-grow p-4 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-center">
				<Card className="w-full md:max-w-md">
					<CardContent className="p-0 flex justify-center">
						<Calendar
							mode="single"
							selected={date}
							onSelect={setDate}
							className="rounded-md"
							components={{ DayContent: DayWithDot }}
						/>
					</CardContent>
				</Card>
				<div className="w-full md:max-w-md space-y-4 flex-1">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-bold">
							{date ? format(date, "PPP") : "Select a date"}
						</h2>
						<Button onClick={handleAddEventClick}>
							<PlusIcon className="mr-2 h-4 w-4" /> Add Event
						</Button>
					</div>
					<div className="space-y-4">
						{isLoadingEvents ? (
							<p>Loading events...</p>
						) : selectedDayEvents.length > 0 ? (
							selectedDayEvents.map((event) => (
								<EventItem
									key={event.id}
									event={event}
									onEdit={handleEditEvent}
									onDelete={handleDeleteEvent}
								/>
							))
						) : (
							<p className="text-muted-foreground">No events for this day.</p>
						)}
					</div>
				</div>
				{isDialogOpen && (
					<EventFormDialog
						pageId={pageData.id}
						isOpen={isDialogOpen}
						onClose={() => setIsDialogOpen(false)}
						event={selectedEvent}
						selectedDate={date || new Date()}
					/>
				)}
			</div>
		</div>
	);
};

export default CalendarEditor;
