import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Briefcase } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";

type Profile = Tables<"profiles">;

interface GeneralSettingsProps {
	profile: Profile | null;
	userId: string | undefined;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
	profile,
	userId,
}) => {
	const [workspaceName, setWorkspaceName] = useState(
		profile?.workspace_name || ""
	);
	const [workspaceIconUrl, setWorkspaceIconUrl] = useState(
		profile?.workspace_icon_url || null
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	useEffect(() => {
		if (profile) {
			setWorkspaceName(profile.workspace_name || "Personal Workspace");
			setWorkspaceIconUrl(profile.workspace_icon_url || null);
		}
	}, [profile]);

	if (!userId) return null;

	const handleIconUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);

		const fileExt = file.name.split(".").pop();
		const fileName = `${userId}-${Date.now()}.${fileExt}`;
		const filePath = `${fileName}`;

		// First delete old icon if it exists
		if (workspaceIconUrl) {
			const oldIconPath = workspaceIconUrl.split("/").pop();
			if (oldIconPath) {
				await supabase.storage.from("images").remove([oldIconPath]);
			}
		}

		const { error: uploadError } = await supabase.storage
			.from("images")
			.upload(filePath, file);

		if (uploadError) {
			toast({
				title: "Upload Error",
				description: uploadError.message,
				variant: "destructive",
			});
			setIsUploading(false);
			return;
		}

		const { data } = supabase.storage.from("images").getPublicUrl(filePath);
		const newIconUrl = data.publicUrl;

		const { error: updateError } = await supabase
			.from("profiles")
			.update({ workspace_icon_url: newIconUrl })
			.eq("id", userId);

		setIsUploading(false);

		if (updateError) {
			toast({
				title: "Error",
				description: "Could not update workspace icon. " + updateError.message,
				variant: "destructive",
			});
		} else {
			setWorkspaceIconUrl(newIconUrl);
			toast({ title: "Success", description: "Workspace icon updated." });
			window.location.reload();
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		const { error } = await supabase
			.from("profiles")
			.update({ workspace_name: workspaceName })
			.eq("id", userId);
		setIsSaving(false);

		if (error) {
			toast({
				title: "Error",
				description: "Could not update workspace name. " + error.message,
				variant: "destructive",
			});
		} else {
			toast({ title: "Success", description: "Workspace name updated." });
			window.location.reload();
		}
	};

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-bold">General</h2>
				<p className="text-muted-foreground">
					Manage general workspace settings here.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Workspace Settings</CardTitle>
					<CardDescription>
						Update your workspace name and icon.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarImage src={workspaceIconUrl ?? undefined} />
							<AvatarFallback>
								<Briefcase className="h-8 w-8" />
							</AvatarFallback>
						</Avatar>
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
						>
							<Upload className="mr-2 h-4 w-4" />
							{isUploading ? "Uploading..." : "Upload Icon"}
						</Button>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleIconUpload}
							className="hidden"
							accept="image/png, image/jpeg, image/gif"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="workspaceName">Workspace Name</Label>
						<Input
							id="workspaceName"
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</CardFooter>
			</Card>

			<Card className="border-destructive">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						Deleting your workspace is a permanent action. All your pages and
						associated data will be removed and cannot be recovered.
					</p>
					<Button
						variant="destructive"
						onClick={() => setIsDeleteDialogOpen(true)}
					>
						Delete Workspace
					</Button>
				</CardContent>
			</Card>

			<DeleteWorkspaceDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</div>
	);
};

export default GeneralSettings;
