import React from "react";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type Notification = Tables<"notifications">;

interface NotificationItemProps {
	notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	notification,
}) => {
	const queryClient = useQueryClient();

	const getNotificationMessage = (notification: Notification): string => {
		switch (notification.type) {
			case "TASKS_DUE_TODAY":
				const data = notification.data as {
					count?: number;
					tasks?: { text: string }[];
				};
				const count = data?.count || 0;
				const tasks = data?.tasks || [];

				if (count === 0) {
					return "You have no tasks due today.";
				}
				if (count === 1 && tasks.length === 1) {
					return `Task "${tasks[0].text}" is due today.`;
				}
				if (count > 1 && tasks.length === 1) {
					return `Task "${tasks[0].text}" and ${
						count - 1
					} other task(s) are due today.`;
				}
				if (count > 1) {
					return `You have ${count} tasks due today.`;
				}
				return "You have a task due today.";
			default:
				return "You have a new notification.";
		}
	};

	const handleClick = async () => {
		await supabase.from("notifications").delete().eq("id", notification.id);

		queryClient.invalidateQueries({
			queryKey: ["notifications", notification.user_id],
		});
		queryClient.invalidateQueries({
			queryKey: ["unread_notifications_count", notification.user_id],
		});
	};

	const content = (
		<div className="flex items-start gap-3 py-2 px-3">
			<div className="flex-shrink-0 mt-1">
				{!notification.is_read && (
					<div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
				)}
			</div>
			<div className="flex-1">
				<p className={cn("text-sm", "font-semibold")}>
					{getNotificationMessage(notification)}
				</p>
				<p className="text-xs text-muted-foreground mt-0.5">
					{formatDistanceToNow(new Date(notification.created_at), {
						addSuffix: true,
					})}
				</p>
			</div>
		</div>
	);

	return (
		<DropdownMenuItem asChild className="cursor-pointer p-0 m-1 rounded-md">
			<Link
				to={notification.link_to || "/workspace"}
				onClick={handleClick}
				className="block"
			>
				{content}
			</Link>
		</DropdownMenuItem>
	);
};

export default NotificationItem;
