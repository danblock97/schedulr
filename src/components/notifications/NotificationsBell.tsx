import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsDropdown from "./NotificationsDropdown";

const fetchUnreadCount = async (userId: string) => {
	const { count, error } = await supabase
		.from("notifications")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId)
		.eq("is_read", false);

	if (error) {
		console.error("Error fetching unread notification count:", error);
		return 0;
	}
	return count || 0;
};

interface NotificationsBellProps {
	user: User;
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ user }) => {
	const { data: unreadCount, refetch } = useQuery({
		queryKey: ["unread_notifications_count", user.id],
		queryFn: () => fetchUnreadCount(user.id),
		staleTime: 60 * 1000, // 1 minute
	});

	React.useEffect(() => {
		const channel = supabase
			.channel("notifications-bell")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					refetch();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, user.id, refetch]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount && unreadCount > 0 && (
						<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 md:w-96">
				<NotificationsDropdown userId={user.id} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationsBell;
