import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import type {
	Tables,
	TablesInsert,
	TablesUpdate,
} from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

type CalendarEvent = Tables<"calendar_events">;

const formSchema = z
	.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().optional(),
		start_date: z.date({ required_error: "Start date is required." }),
		start_time_str: z
			.string()
			.regex(
				/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
				"Invalid time format (HH:mm)"
			),
		end_date: z.date({ required_error: "End date is required." }),
		end_time_str: z
			.string()
			.regex(
				/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
				"Invalid time format (HH:mm)"
			),
	})
	.refine(
		(data) => {
			const startDateTime = new Date(data.start_date);
			const [startHour, startMinute] = data.start_time_str
				.split(":")
				.map(Number);
			startDateTime.setHours(startHour, startMinute, 0, 0);

			const endDateTime = new Date(data.end_date);
			const [endHour, endMinute] = data.end_time_str.split(":").map(Number);
			endDateTime.setHours(endHour, endMinute, 0, 0);

			return endDateTime >= startDateTime;
		},
		{
			message: "End date and time must be after start date and time.",
			path: ["end_date"],
		}
	);

type EventFormData = z.infer<typeof formSchema>;

interface EventFormDialogProps {
	pageId: string;
	event?: CalendarEvent | null;
	isOpen: boolean;
	onClose: () => void;
	selectedDate: Date;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
	pageId,
	event,
	isOpen,
	onClose,
	selectedDate,
}) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const form = useForm<EventFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			start_time_str: "09:00",
			end_time_str: "10:00",
		},
	});

	useEffect(() => {
		if (event) {
			form.reset({
				title: event.title,
				description: event.description || "",
				start_date: new Date(event.start_time),
				start_time_str: format(new Date(event.start_time), "HH:mm"),
				end_date: new Date(event.end_time),
				end_time_str: format(new Date(event.end_time), "HH:mm"),
			});
		} else {
			form.reset({
				title: "",
				description: "",
				start_date: selectedDate,
				start_time_str: "09:00",
				end_date: selectedDate,
				end_time_str: "10:00",
			});
		}
	}, [event, isOpen, form, selectedDate]);

	const createOrUpdateEventMutation = useMutation({
		mutationFn: async (formData: EventFormData) => {
			const { start_date, start_time_str, end_date, end_time_str, ...rest } =
				formData;

			const startDateTime = new Date(start_date);
			const [startHour, startMinute] = start_time_str.split(":").map(Number);
			startDateTime.setHours(startHour, startMinute);

			const endDateTime = new Date(end_date);
			const [endHour, endMinute] = end_time_str.split(":").map(Number);
			endDateTime.setHours(endHour, endMinute);

			const eventData = {
				...rest,
				page_id: pageId,
				start_time: startDateTime.toISOString(),
				end_time: endDateTime.toISOString(),
			};

			if (event) {
				const { error } = await supabase
					.from("calendar_events")
					.update(eventData)
					.eq("id", event.id);
				if (error) throw new Error(error.message);
			} else {
				const { error } = await supabase
					.from("calendar_events")
					.insert(eventData as TablesInsert<"calendar_events">);
				if (error) throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast({ title: `Event ${event ? "updated" : "created"} successfully` });
			queryClient.invalidateQueries({ queryKey: ["calendarEvents", pageId] });
			onClose();
		},
		onError: (error: Error) => {
			toast({
				title: `Error ${event ? "updating" : "creating"} event`,
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = (data: EventFormData) => {
		createOrUpdateEventMutation.mutate(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{event ? "Edit Event" : "Add Event"}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Team Meeting" {...field} />
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
											placeholder="Discuss project progress"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="start_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Date</FormLabel>
										<FormControl>
											<DatePicker date={field.value} setDate={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="start_time_str"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="end_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Date</FormLabel>
										<FormControl>
											<DatePicker date={field.value} setDate={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="end_time_str"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="ghost">
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={createOrUpdateEventMutation.isPending}
							>
								{createOrUpdateEventMutation.isPending ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EventFormDialog;
