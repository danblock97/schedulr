import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import SettingsSidebar from "./SettingsSidebar";
import AccountSettings from "./sections/AccountSettings";
import NotificationsSettings from "./sections/NotificationsSettings";
import PreferencesSettings from "./sections/PreferencesSettings";
import ConnectionsSettings from "./sections/ConnectionsSettings";
import GeneralSettings from "./sections/GeneralSettings";
import AppVersionSettings from "./sections/AppVersionSettings";
import DesktopAppSettings from "./sections/DesktopAppSettings";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	profile: Tables<"profiles"> | null;
}

type ActiveView =
	| "account"
	| "preferences"
	| "notifications"
	| "connections"
	| "general"
	| "desktop-app"
	| "app-version";

const SettingsDialog: React.FC<SettingsDialogProps> = ({
	open,
	onOpenChange,
	user,
	profile,
}) => {
	const [activeView, setActiveView] = useState<ActiveView>("account");
	const isMobile = useIsMobile();

	const currentUser = {
		username:
			profile?.username ||
			user?.user_metadata?.username ||
			user?.email?.split("@")[0] ||
			"User",
		email: user?.email || "No email provided",
		avatar_url: profile?.avatar_url || null,
	};

	const renderContent = () => {
		switch (activeView) {
			case "account":
				return <AccountSettings currentUser={currentUser} user={user} />;
			case "preferences":
				return <PreferencesSettings profile={profile} userId={user?.id} />;
			case "notifications":
				return <NotificationsSettings profile={profile} userId={user?.id} />;
			case "connections":
				return <ConnectionsSettings />;
			case "general":
				return <GeneralSettings profile={profile} userId={user?.id} />;
			case "desktop-app":
				return <DesktopAppSettings />;
			case "app-version":
				return <AppVersionSettings />;
			default:
				return <AccountSettings currentUser={currentUser} user={user} />;
		}
	};

	if (isMobile) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
					<DialogHeader className="sr-only">
						<DialogTitle className="sr-only">Settings</DialogTitle>
					</DialogHeader>
					<div className="space-y-8">
						<AccountSettings currentUser={currentUser} user={user} />
						<PreferencesSettings profile={profile} userId={user?.id} />
						<NotificationsSettings profile={profile} userId={user?.id} />
						<ConnectionsSettings />
						<GeneralSettings profile={profile} userId={user?.id} />
						<AppVersionSettings />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl w-full h-[80vh] p-0 gap-0 overflow-hidden">
				<DialogHeader className="sr-only">
					<DialogTitle className="sr-only">Settings</DialogTitle>
				</DialogHeader>
				<div className="flex h-full">
					<SettingsSidebar
						activeView={activeView}
						setActiveView={setActiveView}
						currentUser={currentUser}
					/>
					<div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsDialog;
