import React, { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface DeleteWorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DeleteWorkspaceDialog: React.FC<DeleteWorkspaceDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleDelete = async () => {
		setIsDeleting(true);
		const { error } = await supabase.rpc("delete_workspace");
		setIsDeleting(false);

		if (error) {
			toast({
				title: "Error",
				description: "Could not delete workspace. " + error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Success",
				description: "Your workspace has been deleted.",
			});
			onOpenChange(false);
			navigate("/workspace", { replace: true });
			window.location.reload();
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your
						workspace and remove all associated data, including pages, tasks,
						and events.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						asChild
					>
						<Button variant="destructive" disabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete Workspace"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteWorkspaceDialog;
