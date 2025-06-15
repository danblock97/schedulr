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
				const taskCount = (notification.data as { count?: number })?.count || 0;
				if (taskCount > 1) {
					return `You have ${taskCount} tasks due today.`;
				}
				return `You have 1 task due today.`;
			default:
				return "You have a new notification.";
		}
	};

	const handleClick = async () => {
		if (!notification.is_read) {
			await supabase
				.from("notifications")
				.update({ is_read: true })
				.eq("id", notification.id);

			queryClient.invalidateQueries({
				queryKey: ["notifications", notification.user_id],
			});
			queryClient.invalidateQueries({
				queryKey: ["unread_notifications_count", notification.user_id],
			});
		}
	};

	const content = (
		<div className="flex items-start gap-3 py-2 px-3">
			<div className="flex-shrink-0 mt-1">
				{!notification.is_read && (
					<div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
				)}
			</div>
			<div className="flex-1">
				<p className={cn("text-sm", !notification.is_read && "font-semibold")}>
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
