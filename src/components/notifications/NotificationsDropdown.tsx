import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import NotificationItem from "./NotificationItem";
import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Notification = Tables<"notifications">;

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
	const { data, error } = await supabase
		.from("notifications")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(10);

	if (error) {
		console.error("Error fetching notifications:", error);
		throw new Error(error.message);
	}
	return data || [];
};

interface NotificationsDropdownProps {
	userId: string;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
	userId,
}) => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const {
		data: notifications,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["notifications", userId],
		queryFn: () => fetchNotifications(userId),
	});

	const clearAllMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from("notifications")
				.delete()
				.eq("user_id", userId);

			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
			queryClient.invalidateQueries({
				queryKey: ["unread_notifications_count", userId],
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Could not clear all notifications.",
				variant: "destructive",
			});
			console.error("Error clearing notifications", error);
		},
	});

	return (
		<>
			<div className="flex justify-between items-center">
				<DropdownMenuLabel className="text-base font-semibold">
					Notifications
				</DropdownMenuLabel>
				<div className="pr-2">
					<Button
						variant="link"
						size="sm"
						onClick={() => clearAllMutation.mutate()}
						disabled={
							clearAllMutation.isPending ||
							!notifications ||
							notifications.length === 0
						}
					>
						{clearAllMutation.isPending ? "Clearing..." : "Clear all"}
					</Button>
				</div>
			</div>
			<DropdownMenuSeparator />
			<div className="max-h-80 overflow-y-auto">
				{isLoading && (
					<p className="p-4 text-sm text-center text-muted-foreground">
						Loading...
					</p>
				)}
				{isError && (
					<p className="p-4 text-sm text-center text-destructive">
						Failed to load notifications.
					</p>
				)}
				{!isLoading &&
					!isError &&
					(notifications && notifications.length > 0 ? (
						notifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
							/>
						))
					) : (
						<p className="p-4 text-sm text-center text-muted-foreground">
							You're all caught up!
						</p>
					))}
			</div>
		</>
	);
};

export default NotificationsDropdown;
