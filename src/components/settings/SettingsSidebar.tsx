import React from "react";
import { Button } from "@/components/ui/button";
import {
	User,
	Bell,
	Link,
	Settings,
	SlidersHorizontal,
	Monitor,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ActiveView =
	| "account"
	| "preferences"
	| "notifications"
	| "connections"
	| "general"
	| "desktop-app"
	| "app-version";

interface SettingsSidebarProps {
	activeView: ActiveView;
	setActiveView: (view: ActiveView) => void;
	currentUser: { username: string; email: string; avatar_url: string | null };
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
	activeView,
	setActiveView,
	currentUser,
}) => {
	const menuItems = [
		{
			group: "Account",
			items: [
				{ id: "account", label: "My Profile", icon: User },
				{ id: "preferences", label: "Preferences", icon: SlidersHorizontal },
				{ id: "notifications", label: "Notifications", icon: Bell },
				{ id: "connections", label: "Connections", icon: Link },
			],
		},
		{
			group: "Workspace",
			items: [
				{ id: "general", label: "General", icon: Settings },
				{ id: "desktop-app", label: "Desktop App", icon: Monitor },
				{ id: "app-version", label: "App Version", icon: Monitor },
			],
		},
	];

	return (
		<div className="w-64 bg-muted/50 border-r p-4 flex flex-col">
			<div className="flex-grow">
				{menuItems.map((group) => (
					<div key={group.group} className="mb-6">
						<h3 className="text-xs text-muted-foreground font-semibold uppercase px-3 mb-2">
							{group.group}
						</h3>
						<ul>
							{group.items.map((item) => (
								<li key={item.id}>
									<Button
										variant={activeView === item.id ? "secondary" : "ghost"}
										className="w-full justify-start"
										onClick={() => setActiveView(item.id as ActiveView)}
									>
										<item.icon className="mr-2 h-4 w-4" />
										{item.label}
									</Button>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t pt-4 flex items-center gap-3">
				<Avatar className="h-9 w-9">
					<AvatarImage
						src={currentUser.avatar_url ?? undefined}
						alt={currentUser.username}
					/>
					<AvatarFallback>
						{currentUser.username?.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div>
					<p className="text-sm font-semibold truncate">
						{currentUser.username}
					</p>
					<p className="text-xs text-muted-foreground truncate">
						{currentUser.email}
					</p>
				</div>
			</div>
		</div>
	);
};

export default SettingsSidebar;
