import React from "react";
import { FileText } from "lucide-react";

const EditorLoading = ({ message }: { message: string }) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
			<div className="animate-pulse text-muted-foreground">
				<FileText className="h-12 w-12 mx-auto mb-2" />
				{message}
			</div>
		</div>
	);
};

export default EditorLoading;
