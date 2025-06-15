import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface NotificationsSettingsProps {
	profile: Profile | null;
	userId: string | undefined;
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({
	profile,
	userId,
}) => {
	const { toast } = useToast();
	const [receiveNotifications, setReceiveNotifications] = useState(
		profile?.receive_notifications ?? true
	);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (profile) {
			setReceiveNotifications(profile.receive_notifications);
		}
	}, [profile]);

	const handleToggle = async (checked: boolean) => {
		if (!userId) return;

		setIsSaving(true);
		setReceiveNotifications(checked);

		const { error } = await supabase
			.from("profiles")
			.update({
				receive_notifications: checked,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId);

		if (error) {
			toast({
				title: "Error updating notification settings",
				description: error.message,
				variant: "destructive",
			});
			// revert state on error
			setReceiveNotifications(!checked);
		} else {
			toast({
				title: "Notification settings updated",
			});
		}
		setIsSaving(false);
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Notifications</h2>
			<div className="space-y-8">
				<div>
					<h3 className="text-lg font-semibold mb-2">General Notifications</h3>
					<div className="flex items-center justify-between p-4 border rounded-lg">
						<div>
							<p className="font-medium">Receive notifications</p>
							<p className="text-sm text-muted-foreground">
								Enable or disable all notifications.
							</p>
						</div>
						<Switch
							checked={receiveNotifications}
							onCheckedChange={handleToggle}
							disabled={isSaving}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationsSettings;
