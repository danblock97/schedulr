import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const EditorNotFound = ({ error }: { error?: string | null }) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
			<FileText className="h-12 w-12 mx-auto mb-2 text-destructive" />
			<h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
			<p className="text-muted-foreground mb-4">
				{error
					? error
					: "The page you are looking for does not exist or you may not have permission to view it."}
			</p>
			<Button asChild variant="outline">
				<Link to="/workspace">
					<ArrowLeft className="mr-2 h-4 w-4" /> Go to Workspace
				</Link>
			</Button>
		</div>
	);
};

export default EditorNotFound;
