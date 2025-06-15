import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required."),
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters long."),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userEmail?: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
	open,
	onOpenChange,
	userEmail,
}) => {
	const { toast } = useToast();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof passwordSchema>>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		navigate("/");
	};

	const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
		if (!userEmail) {
			toast({
				title: "Error",
				description: "User email not found.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: userEmail,
			password: values.currentPassword,
		});

		if (signInError) {
			toast({
				title: "Incorrect password",
				description: "The current password you entered is incorrect.",
				variant: "destructive",
			});
			form.setError("currentPassword", {
				type: "manual",
				message: "Incorrect current password.",
			});
			setIsSubmitting(false);
			return;
		}

		const { error } = await supabase.auth.updateUser({
			password: values.newPassword,
		});

		if (error) {
			toast({
				title: "Error changing password",
				description: error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Password changed successfully!",
				description: "You will be signed out for security reasons.",
			});
			setTimeout(() => {
				handleSignOut();
			}, 3000);
		}
		setIsSubmitting(false);
		onOpenChange(false);
		form.reset();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Enter your current password and a new password for your account. You
						will be logged out after changing it.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="ghost">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Changing..." : "Change Password"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default ChangePasswordDialog;
