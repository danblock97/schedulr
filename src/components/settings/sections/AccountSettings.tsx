import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import ChangePasswordDialog from "./ChangePasswordDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface AccountSettingsProps {
	currentUser: { username: string; email: string; avatar_url: string | null };
	user: User | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
	currentUser,
	user,
}) => {
	const { toast } = useToast();
	const navigate = useNavigate();
	const [username, setUsername] = useState(currentUser.username);
	const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
	const [isUploading, setIsUploading] = useState(false);
	const [isSavingName, setIsSavingName] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setUsername(currentUser.username);
		setAvatarUrl(currentUser.avatar_url);
	}, [currentUser]);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!event.target.files || event.target.files.length === 0 || !user) {
			return;
		}

		const file = event.target.files[0];
		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}-${Math.random()}.${fileExt}`;
		const filePath = `${fileName}`;

		setIsUploading(true);

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from("avatars")
			.upload(filePath, file, { upsert: true });

		if (uploadError) {
			toast({
				title: "Error uploading avatar",
				description: uploadError.message,
				variant: "destructive",
			});
			setIsUploading(false);
			return;
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

		// Update user metadata in auth
		const { error: authError } = await supabase.auth.updateUser({
			data: { avatar_url: publicUrl },
		});

		if (authError) {
			toast({
				title: "Error updating user data",
				description: authError.message,
				variant: "destructive",
			});
			setIsUploading(false);
			return;
		}

		const { error: updateError } = await supabase
			.from("profiles")
			.update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
			.eq("id", user.id);

		if (updateError) {
			toast({
				title: "Error updating profile",
				description: updateError.message,
				variant: "destructive",
			});
		} else {
			setAvatarUrl(publicUrl);
			toast({ title: "Avatar updated successfully!" });
			// This is a bit of a hack to force a re-render of the sidebar.
			window.location.reload();
		}

		setIsUploading(false);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	const handleSaveName = async () => {
		if (!user || username === currentUser.username) return;

		setIsSavingName(true);

		const { error: authError } = await supabase.auth.updateUser({
			data: { username: username },
		});

		if (authError) {
			toast({
				title: "Error updating name",
				description: authError.message,
				variant: "destructive",
			});
			setIsSavingName(false);
			return;
		}

		const { error: profileError } = await supabase
			.from("profiles")
			.update({ username: username, updated_at: new Date().toISOString() })
			.eq("id", user.id);

		if (profileError) {
			toast({
				title: "Error updating profile",
				description: profileError.message,
				variant: "destructive",
			});
		} else {
			toast({ title: "Name updated successfully!" });
			// This is a bit of a hack to force a re-render of the sidebar.
			window.location.reload();
		}
		setIsSavingName(false);
	};

	const handleDeleteAccount = async () => {
		if (!user) return;

		setIsDeleting(true);

		const { error } = await supabase.rpc("delete_user_account");

		if (error) {
			toast({
				title: "Error deleting account",
				description: error.message,
				variant: "destructive",
			});
			setIsDeleting(false);
			setIsDeleteAccountOpen(false);
		} else {
			toast({
				title: "Account deleted successfully",
				description: "You have been signed out.",
			});
			await supabase.auth.signOut();
			navigate("/");
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">My Profile</h2>
			<div className="space-y-8">
				<div>
					<h3 className="text-lg font-semibold mb-4">Preferred name</h3>
					<div className="flex items-center gap-4">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={avatarUrl ?? undefined}
								alt={currentUser.username}
							/>
							<AvatarFallback>
								{currentUser.username?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex items-center gap-2">
							<Input
								value={username}
								onChange={handleNameChange}
								className="max-w-sm"
							/>
							{username !== currentUser.username && (
								<Button onClick={handleSaveName} disabled={isSavingName}>
									{isSavingName ? "Saving..." : "Save"}
								</Button>
							)}
						</div>
					</div>
					<p className="text-sm text-muted-foreground mt-2">
						<button
							className="text-blue-500 hover:underline"
							onClick={handleAvatarClick}
							disabled={isUploading}
						>
							{isUploading ? "Uploading..." : "Add photo"}
						</button>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="hidden"
							accept="image/png, image/jpeg"
						/>
					</p>
				</div>

				<div className="border-t pt-8">
					<h3 className="text-lg font-semibold mb-1">Account security</h3>
					<div className="space-y-6 mt-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Email</p>
								<p className="text-sm text-muted-foreground">
									{currentUser.email}
								</p>
							</div>
							<Button variant="outline" disabled>
								Change email
							</Button>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Password</p>
								<p className="text-sm text-muted-foreground">
									Change your password to login to your account.
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setIsChangePasswordOpen(true)}
							>
								Change password
							</Button>
						</div>
					</div>
				</div>

				<div className="border-t pt-8">
					<Button
						variant="destructive"
						onClick={() => setIsDeleteAccountOpen(true)}
					>
						Delete my account
					</Button>
				</div>
			</div>
			<ChangePasswordDialog
				open={isChangePasswordOpen}
				onOpenChange={setIsChangePasswordOpen}
				userEmail={user?.email}
			/>
			<DeleteAccountDialog
				open={isDeleteAccountOpen}
				onOpenChange={setIsDeleteAccountOpen}
				onConfirm={handleDeleteAccount}
				isDeleting={isDeleting}
			/>
		</div>
	);
};

export default AccountSettings;
