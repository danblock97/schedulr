import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { applyTheme, type Theme } from "@/lib/theme";

type Profile = Tables<"profiles">;

interface PreferencesSettingsProps {
	profile: Profile | null;
	userId: string | undefined;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
	profile,
	userId,
}) => {
	const { toast } = useToast();
	const [currentTheme, setCurrentTheme] = useState<Theme>(
		(profile?.theme as Theme) || "system"
	);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		if (profile?.theme) {
			setCurrentTheme(profile.theme as Theme);
		}
	}, [profile]);

	const handleThemeChange = async (theme: Theme) => {
		if (!userId || isUpdating) return;

		setIsUpdating(true);
		try {
			const { error } = await supabase
				.from("profiles")
				.update({ theme })
				.eq("id", userId);

			if (error) throw error;

			applyTheme(theme);
			setCurrentTheme(theme);
			toast({ title: "Success", description: `Theme set to ${theme}.` });
		} catch (error: any) {
			toast({
				title: "Error updating theme",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-1">Preferences</h2>
			<p className="text-muted-foreground mb-6">
				Manage your account preferences.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Theme</CardTitle>
					<CardDescription>
						Select how you want the application to look. This will be saved to
						your profile.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<RadioGroup
						value={currentTheme}
						onValueChange={(value) => handleThemeChange(value as Theme)}
						disabled={isUpdating}
						className="space-y-2"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="light" id="theme-light" />
							<Label htmlFor="theme-light">Light</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="dark" id="theme-dark" />
							<Label htmlFor="theme-dark">Dark</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="system" id="theme-system" />
							<Label htmlFor="theme-system">System</Label>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>
		</div>
	);
};

export default PreferencesSettings;
